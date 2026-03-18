// OSRM public API for real street routing
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Average walking speed in m/s (~5 km/h)
const WALKING_SPEED = 1.4;

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
}

function parseOSRMRoute(route: any): RouteResult {
  const distance = route.distance;
  return {
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    ),
    distance,
    duration: distance / WALKING_SPEED,
  };
}

/**
 * Calculate total cumulative angular change along a route (in degrees).
 */
function totalAngularChange(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const step = Math.max(1, Math.floor(coords.length / 50));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) sampled.push(coords[i]);
  if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
    sampled.push(coords[coords.length - 1]);
  }
  let total = 0;
  for (let i = 1; i < sampled.length - 1; i++) {
    const [lat1, lon1] = sampled[i - 1];
    const [lat2, lon2] = sampled[i];
    const [lat3, lon3] = sampled[i + 1];
    const b1 = Math.atan2(lon2 - lon1, lat2 - lat1);
    const b2 = Math.atan2(lon3 - lon2, lat3 - lat2);
    let diff = Math.abs(b2 - b1) * (180 / Math.PI);
    if (diff > 180) diff = 360 - diff;
    total += diff;
  }
  return total;
}

function turnsPerKm(route: RouteResult): number {
  return totalAngularChange(route.coordinates) / (route.distance / 1000);
}

/**
 * Deduplicate routes that are essentially the same path (within 3% distance of each other).
 */
function deduplicateRoutes(routes: RouteResult[]): RouteResult[] {
  const unique: RouteResult[] = [];
  for (const r of routes) {
    const isDuplicate = unique.some(u => Math.abs(u.distance - r.distance) / u.distance < 0.03);
    if (!isDuplicate) unique.push(r);
  }
  return unique;
}

/**
 * Small perpendicular waypoint to nudge route onto parallel streets.
 */
function getNudgeWaypoint(
  origin: [number, number],
  destination: [number, number],
  offsetDeg: number
): [number, number] {
  const dLat = destination[0] - origin[0];
  const dLon = destination[1] - origin[1];
  const len = Math.sqrt(dLat * dLat + dLon * dLon);
  if (len === 0) return origin;
  
  // Point at 40% along the line
  const t = 0.4;
  const midLat = origin[0] + dLat * t;
  const midLon = origin[1] + dLon * t;
  
  // Perpendicular
  const perpLat = (-dLon / len) * offsetDeg;
  const perpLon = (dLat / len) * offsetDeg;
  
  return [midLat + perpLat, midLon + perpLon];
}

/**
 * Fetch two walking routes:
 * - Zenit (safe): best-lit walking route (most street lamps nearby)
 * - Standard (fast): shortest walking route
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  const dist = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
  );
  // Use larger nudges to force genuinely different street choices
  const nudge = Math.max(0.004, dist * 0.25);
  const wp1 = getNudgeWaypoint(origin, destination, nudge);
  const wp2 = getNudgeWaypoint(origin, destination, -nudge);
  const wp3 = getNudgeWaypoint(origin, destination, nudge * 1.5);
  const wp4 = getNudgeWaypoint(origin, destination, -nudge * 1.5);
  const toCoords = (wps: [number, number][]) =>
    [origin, ...wps, destination].map(p => `${p[1]},${p[0]}`).join(';');

  // Fetch walking routes in parallel — direct with alternatives + nudged variants
  const [directRes, wp1Res, wp2Res, wp3Res, wp4Res] = await Promise.all([
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson&alternatives=3`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${toCoords([wp1])}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${toCoords([wp2])}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${toCoords([wp3])}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${toCoords([wp4])}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
  ]);

  const all: RouteResult[] = [];
  for (const res of [directRes, wp1Res, wp2Res, wp3Res, wp4Res]) {
    if (res?.code === 'Ok' && res.routes?.length) {
      for (const route of res.routes) all.push(parseOSRMRoute(route));
    }
  }

  // Deduplicate routes that are essentially the same path
  const candidates = deduplicateRoutes(all);

  if (candidates.length === 0) return { safe: null, fast: null };

  // Standard (fast) = shortest route
  const fast = [...candidates].sort((a, b) => a.distance - b.distance)[0];

  // Zenit (safe) = best-lit route using OSM street lamp data
  let safe: RouteResult;
  try {
    const { fetchStreetLamps, scoreLighting, getBoundingBox } = await import('./streetlamps');
    const bbox = getBoundingBox(candidates.map(r => r.coordinates));
    const lamps = await fetchStreetLamps(bbox.minLat, bbox.minLon, bbox.maxLat, bbox.maxLon);

    if (lamps.length > 0) {
      const scored = candidates.map(r => ({ route: r, score: scoreLighting(r.coordinates, lamps) }));
      scored.sort((a, b) => b.score - a.score);
      safe = scored[0].route;
      console.log('Zenit lighting scores:', scored.map(s => `${Math.round(s.score * 100)}%`));
    } else {
      safe = [...candidates].sort((a, b) => turnsPerKm(a) - turnsPerKm(b))[0];
    }
  } catch {
    safe = [...candidates].sort((a, b) => turnsPerKm(a) - turnsPerKm(b))[0];
  }

  // If safe and fast ended up being the same route, pick a different one for fast
  if (safe === fast && candidates.length > 1) {
    const others = candidates.filter(r => r !== safe);
    return { safe, fast: others.sort((a, b) => a.distance - b.distance)[0] };
  }

  return { safe, fast };
}

/** Store the selected route in sessionStorage for cross-page use */
export function storeSelectedRoute(route: RouteResult) {
  sessionStorage.setItem('zenit_selected_route', JSON.stringify(route));
}

/** Retrieve the selected route from sessionStorage */
export function getStoredRoute(): RouteResult | null {
  const data = sessionStorage.getItem('zenit_selected_route');
  return data ? JSON.parse(data) : null;
}
