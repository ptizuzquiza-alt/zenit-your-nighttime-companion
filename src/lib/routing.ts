// OSRM public routing API (CORS enabled)
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Average walking speed in m/s (~5 km/h)
const WALKING_SPEED = 1.4;

/** Fetch with timeout */
async function fetchWithTimeout(path: string, ms = 8000): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(`${OSRM_BASE}/${path}`, { signal: controller.signal })
    .then((r) => r.json())
    .catch(() => null)
    .finally(() => clearTimeout(id));
}

export interface RouteStep {
  distance: number;       // meters
  instruction: string;
  direction: 'left' | 'right' | 'straight';
  streetName: string;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

function mapManeuverDirection(modifier?: string): 'left' | 'right' | 'straight' {
  if (!modifier) return 'straight';
  if (modifier.includes('left')) return 'left';
  if (modifier.includes('right')) return 'right';
  return 'straight';
}

function parseOSRMRoute(route: any): RouteResult {
  const distance = route.distance;
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  );
  const steps: RouteStep[] = (route.legs ?? []).flatMap((leg: any) =>
    (leg.steps ?? [])
      .filter((s: any) => s.distance > 0)
      .map((s: any) => ({
        distance: s.distance,
        instruction: s.maneuver?.type === 'depart'
          ? `Dirígete hacia ${s.name || 'tu destino'}`
          : s.maneuver?.type === 'arrive'
            ? `Llegada a ${s.name || 'tu destino'}`
            : s.maneuver?.modifier
              ? `Gira a la ${mapManeuverDirection(s.maneuver.modifier) === 'left' ? 'izquierda' : mapManeuverDirection(s.maneuver.modifier) === 'right' ? 'derecha' : 'adelante'} en ${s.name || 'la calle'}`
              : `Continúa por ${s.name || 'la calle'}`,
        direction: mapManeuverDirection(s.maneuver?.modifier),
        streetName: s.name || '',
      }))
  );
  return { coordinates, distance, duration: distance / WALKING_SPEED, steps };
}

/** Fraction of route that moves away from destination (0=direct, >0.3=hook) */
function backtrackRatio(
  coords: [number, number][],
  destination: [number, number]
): number {
  if (coords.length < 2) return 0;

  let backward = 0;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const seg = Math.hypot(
      coords[i][0] - coords[i - 1][0],
      coords[i][1] - coords[i - 1][1]
    );
    total += seg;

    const prevD = Math.hypot(
      coords[i - 1][0] - destination[0],
      coords[i - 1][1] - destination[1]
    );
    const currD = Math.hypot(
      coords[i][0] - destination[0],
      coords[i][1] - destination[1]
    );
    if (currD > prevD) backward += seg;
  }

  return total > 0 ? backward / total : 0;
}

/** Two routes are distinct if their midpoints are >50m apart */
function areDistinct(a: RouteResult, b: RouteResult): boolean {
  const ma = a.coordinates[Math.floor(a.coordinates.length / 2)];
  const mb = b.coordinates[Math.floor(b.coordinates.length / 2)];
  if (!ma || !mb) return false;
  return Math.hypot(ma[0] - mb[0], ma[1] - mb[1]) > 0.00045;
}

/**
 * Small perpendicular waypoint to nudge route onto parallel streets.
 */
async function fetchNudged(
  origin: [number, number],
  destination: [number, number],
  offsetDeg: number
): Promise<RouteResult | null> {
  const midLat = (origin[0] + destination[0]) / 2;
  const midLon = (origin[1] + destination[1]) / 2;
  const dLat = destination[0] - origin[0];
  const dLon = destination[1] - origin[1];
  const len = Math.sqrt(dLat * dLat + dLon * dLon) || 1;
  const wpLat = midLat + (-dLon / len) * offsetDeg;
  const wpLon = midLon + (dLat / len) * offsetDeg;

  const coords = `${origin[1]},${origin[0]};${wpLon},${wpLat};${destination[1]},${destination[0]}`;
  const res = await fetchWithTimeout(`foot/${coords}?overview=full&geometries=geojson&steps=true`);

  if (!res || res.code !== 'Ok' || !res.routes?.length) return null;
  return parseOSRMRoute(res.routes[0]);
}

/**
 * Returns two walking routes:
 * - Standard (fast): shortest OSRM path
 * - Zenit (safe): different corridor, clean (no hooks), max 60% longer
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  // Nudge waypoints to force different corridors
  const dist = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
  );
  const nudgeOffset = Math.max(0.002, dist * 0.15);

  const [carRes, footRes, nudgedRes] = await Promise.all([
    fetchWithTimeout(`car/${directCoords}?overview=full&geometries=geojson&alternatives=3&steps=true`),
    fetchWithTimeout(`foot/${directCoords}?overview=full&geometries=geojson&alternatives=2&steps=true`),
    fetchNudged(origin, destination, nudgeOffset),
  ]);

  // --- Fast route: shortest foot path ---
  let fast: RouteResult | null = null;
  if (footRes?.code === 'Ok' && footRes.routes?.length) {
    fast = parseOSRMRoute(
      footRes.routes.sort((a: any, b: any) => a.distance - b.distance)[0]
    );
  }
  if (!fast) {
    // Fallback to car direct
    if (carRes?.code === 'Ok' && carRes.routes?.length) {
      fast = parseOSRMRoute(carRes.routes[0]);
    }
    return { safe: fast, fast };
  }

  // --- Backtracking filter helper ---
  const hasExcessiveBacktracking = (coords: [number, number][]) => {
    if (coords.length < 2) return false;
    let backward = 0, total = 0;
    for (let i = 1; i < coords.length; i++) {
      const seg = Math.hypot(coords[i][0] - coords[i-1][0], coords[i][1] - coords[i-1][1]);
      total += seg;
      const prevD = Math.hypot(coords[i-1][0] - destination[0], coords[i-1][1] - destination[1]);
      const currD = Math.hypot(coords[i][0] - destination[0], coords[i][1] - destination[1]);
      if (currD > prevD) backward += seg;
    }
    return total > 0 && backward / total > 0.3;
  };

  // Turns per km metric (fewer turns = main avenues)
  const turnsPerKm = (r: RouteResult) => {
    let turns = 0;
    for (let i = 2; i < r.coordinates.length; i++) {
      const [p, c, n] = [r.coordinates[i-2], r.coordinates[i-1], r.coordinates[i]];
      const a1 = Math.atan2(c[0] - p[0], c[1] - p[1]);
      const a2 = Math.atan2(n[0] - c[0], n[1] - c[1]);
      let diff = Math.abs(a2 - a1) * (180 / Math.PI);
      if (diff > 180) diff = 360 - diff;
      if (diff > 25) turns++;
    }
    return r.distance > 0 ? (turns / (r.distance / 1000)) : 0;
  };

  // --- Zenit (safe) route: prefer car-profile (main avenues), fewest turns ---
  const maxDist = fast.distance * 1.6;

  // Collect car-profile candidates
  const carCandidates: RouteResult[] = carRes?.code === 'Ok' && carRes.routes?.length
    ? carRes.routes.map(parseOSRMRoute).filter((r: RouteResult) => !hasExcessiveBacktracking(r.coordinates) && r.distance <= maxDist)
    : [];

  // Add nudged route if valid
  if (nudgedRes && !hasExcessiveBacktracking(nudgedRes.coordinates) && nudgedRes.distance <= maxDist) {
    carCandidates.push(nudgedRes);
  }

  // Pick the straightest (fewest turns) that is distinct from fast
  const distinctCandidates = carCandidates
    .filter(r => areDistinct(r, fast!))
    .sort((a, b) => turnsPerKm(a) - turnsPerKm(b));

  let safe: RouteResult | null = distinctCandidates[0] ?? carCandidates[0] ?? null;

  if (!safe) {
    return { safe: fast, fast };
  }

  // Ensure safe is always the longer one
  if (safe.distance < fast.distance) {
    return { safe: fast, fast: safe };
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
