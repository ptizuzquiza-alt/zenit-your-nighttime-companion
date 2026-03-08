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
  return {
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    ),
    distance: route.distance,
    duration: route.duration,
  };
}

/**
 * Calculate a perpendicular offset point to use as waypoint for the safe route.
 * This forces the route to diverge from the direct path, going through different streets.
 */
function getOffsetWaypoint(
  origin: [number, number],
  destination: [number, number],
  offsetKm: number = 0.3
): [number, number] {
  // Midpoint
  const midLat = (origin[0] + destination[0]) / 2;
  const midLon = (origin[1] + destination[1]) / 2;

  // Direction vector
  const dLat = destination[0] - origin[0];
  const dLon = destination[1] - origin[1];

  // Perpendicular (rotate 90 degrees)
  const perpLat = -dLon;
  const perpLon = dLat;

  // Normalize and scale
  const len = Math.sqrt(perpLat * perpLat + perpLon * perpLon);
  if (len === 0) return [midLat, midLon];

  // ~0.009 degrees ≈ 1km at Barcelona's latitude
  const scale = (offsetKm * 0.009) / len;

  return [
    midLat + perpLat * scale,
    midLon + perpLon * scale,
  ];
}

/**
 * Fetch two walking routes (both pedestrian):
 * - Fast: direct foot route (shortest path, small streets, shortcuts)
 * - Safe: foot route via an offset waypoint (forces through different/bigger streets)
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  // Fast route: direct foot path
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  
  // Safe route: foot path via offset waypoint (goes through different streets)
  const waypoint = getOffsetWaypoint(origin, destination);
  const waypointCoords = `${origin[1]},${origin[0]};${waypoint[1]},${waypoint[0]};${destination[1]},${destination[0]}`;

  const [fastRes, safeRes] = await Promise.all([
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
    fetch(`${OSRM_BASE}/foot/${waypointCoords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
  ]);

  let fast: RouteResult | null = null;
  let safe: RouteResult | null = null;

  if (fastRes?.code === 'Ok' && fastRes.routes?.length) {
    fast = parseOSRMRoute(fastRes.routes[0]);
  }

  if (safeRes?.code === 'Ok' && safeRes.routes?.length) {
    safe = parseOSRMRoute(safeRes.routes[0]);
  }

  // Fallback
  if (!safe && fast) safe = fast;
  if (!fast && safe) fast = safe;

  console.log('Routes loaded:', {
    safe: safe ? `${safe.coordinates.length} pts, ${safe.distance}m` : 'null',
    fast: fast ? `${fast.coordinates.length} pts, ${fast.distance}m` : 'null',
    different: safe && fast ? (safe.distance !== fast.distance) : 'n/a'
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
