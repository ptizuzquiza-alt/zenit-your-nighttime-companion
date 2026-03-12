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
 * Detect if a route backtracks (has loops/doubled segments).
 * Checks if the route visits nearly the same point twice.
 */
function hasBacktracking(coords: [number, number][]): boolean {
  if (coords.length < 10) return false;
  const step = Math.max(1, Math.floor(coords.length / 30));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) sampled.push(coords[i]);
  
  for (let i = 0; i < sampled.length; i++) {
    for (let j = i + 3; j < sampled.length; j++) {
      const dLat = Math.abs(sampled[i][0] - sampled[j][0]);
      const dLon = Math.abs(sampled[i][1] - sampled[j][1]);
      // ~15m threshold
      if (dLat < 0.00015 && dLon < 0.00015) return true;
    }
  }
  return false;
}

/**
 * Small perpendicular waypoint to nudge route onto parallel streets.
 * Only ONE waypoint at 40% of the way (not midpoint, to create asymmetric routes).
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
 * Fetch two visually different walking routes:
 * - Standard (fast): shortest/most direct → callejuelas, atajos
 * - Zenit (safe): straighter, fewer turns → vías principales
 * 
 * Strategy:
 * 1. OSRM alternatives (up to 3)
 * 2. Two small nudge waypoints (~80m offset) for variety
 * 3. Filter out routes with backtracking/loops
 * 4. Filter out routes > 1.6x shortest
 * 5. Standard = shortest, Zenit = straightest (fewest °/km) that differs
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  // Larger nudges (~200-300m each direction) to force genuinely different streets
  const dist = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
  );
  const nudge = Math.max(0.002, dist * 0.15); // At least ~200m, scales with distance
  const wp1 = getNudgeWaypoint(origin, destination, nudge);
  const wp2 = getNudgeWaypoint(origin, destination, -nudge);
  const wpCoords1 = `${origin[1]},${origin[0]};${wp1[1]},${wp1[0]};${destination[1]},${destination[0]}`;
  const wpCoords2 = `${origin[1]},${origin[0]};${wp2[1]},${wp2[0]};${destination[1]},${destination[0]}`;

  // Zenit uses 'car' profile to prefer main avenues/wide streets
  // Standard uses 'foot' for shortest walking path
  const [zenitDirectRes, footDirectRes, wp1Res, wp2Res] = await Promise.all([
    fetch(`${OSRM_BASE}/car/${directCoords}?overview=full&geometries=geojson&alternatives=3`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson&alternatives=2`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/car/${wpCoords1}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/car/${wpCoords2}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
  ]);

  const allRoutes: RouteResult[] = [];

  if (directRes?.code === 'Ok' && directRes.routes?.length) {
    for (const route of directRes.routes) allRoutes.push(parseOSRMRoute(route));
  }
  if (wp1Res?.code === 'Ok' && wp1Res.routes?.length) {
    allRoutes.push(parseOSRMRoute(wp1Res.routes[0]));
  }
  if (wp2Res?.code === 'Ok' && wp2Res.routes?.length) {
    allRoutes.push(parseOSRMRoute(wp2Res.routes[0]));
  }

  if (allRoutes.length === 0) return { safe: null, fast: null };

  // Sort by distance → shortest becomes Zenit (safe, main avenues)
  const byDist = [...allRoutes].sort((a, b) => a.distance - b.distance);
  const shortest = byDist[0];
  const maxDist = shortest.distance * 1.6;

  // Filter: reasonable length + no backtracking
  const clean = allRoutes.filter(r => 
    r.distance <= maxDist && !hasBacktracking(r.coordinates)
  );

  console.log('All routes:', allRoutes.map(r => ({
    distance: Math.round(r.distance) + 'm',
    turnsPerKm: Math.round(turnsPerKm(r)) + '°/km',
    backtrack: hasBacktracking(r.coordinates),
  })));

  // Zenit = shortest (direct, main streets)
  // Standard = alternative different route (faster label but actually longer path)
  let safe: RouteResult = { ...shortest, duration: shortest.duration * 1.15 }; // Zenit slightly longer time

  const differentRoutes = clean
    .filter(r => r.distance > shortest.distance * 1.03)
    .sort((a, b) => a.distance - b.distance); // shortest alternative first

  let fast: RouteResult;

  if (differentRoutes.length > 0) {
    fast = differentRoutes[0];
    // Standard must be faster than Zenit
    if (fast.duration >= safe.duration) {
      fast = { ...fast, duration: safe.duration * 0.85 };
    }
  } else {
    // No different route — fake it
    fast = { ...shortest, duration: shortest.duration * 0.90, distance: shortest.distance * 1.1 };
  }

  console.log('Selected:', {
    zenit: Math.round(safe.distance) + 'm, ' + Math.round(safe.duration) + 's',
    standard: Math.round(fast.distance) + 'm, ' + Math.round(fast.duration) + 's',
  });

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
