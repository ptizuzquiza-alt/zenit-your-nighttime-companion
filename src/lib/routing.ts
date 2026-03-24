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

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
}

function parseOSRMRoute(route: any): RouteResult {
  const distance = route.distance;
  const coordinates: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  );
  return { coordinates, distance, duration: distance / WALKING_SPEED };
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
  const res = await fetchWithTimeout(`foot/${coords}?overview=full&geometries=geojson`);

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

  const [res, nudgedRoute] = await Promise.all([
    fetchWithTimeout(`foot/${directCoords}?overview=full&geometries=geojson&alternatives=3`),
    fetchNudged(origin, destination, 0.0012),
  ]);

  if (!res || res.code !== 'Ok' || !res.routes?.length) {
    return { safe: null, fast: null };
  }

  const sorted: RouteResult[] = res.routes
    .map(parseOSRMRoute)
    .sort((a: RouteResult, b: RouteResult) => a.distance - b.distance);

  const fast = sorted[0];
  const maxDist = fast.distance * 1.6;

  const naturalAlts = sorted
    .slice(1)
    .filter((r) => r.distance <= maxDist && areDistinct(r, fast))
    .map((r) => ({ route: r, bt: backtrackRatio(r.coordinates, destination) }));

  const nudgeCandidates = nudgedRoute && nudgedRoute.distance <= maxDist
    ? [{ route: nudgedRoute, bt: backtrackRatio(nudgedRoute.coordinates, destination) }]
    : [];

  const cleanNatural = naturalAlts
    .filter((c) => c.bt < 0.3)
    .sort((a, b) => a.bt - b.bt);

  const safeCandidate = cleanNatural[0]
    ?? nudgeCandidates[0]
    ?? naturalAlts.sort((a, b) => a.bt - b.bt)[0]
    ?? null;

  if (!safeCandidate) {
    return { safe: fast, fast };
  }

  const safe = safeCandidate.route;
  return safe.distance < fast.distance
    ? { safe: fast, fast: safe }
    : { safe, fast };
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
