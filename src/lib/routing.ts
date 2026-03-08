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
    // Recalculate duration based on walking speed for consistency
    duration: distance / WALKING_SPEED,
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
 * Fetch two contrasting walking routes:
 * - Zenit (safe): Uses car profile to force main avenues (straighter, fewer turns),
 *   then recalculates duration at walking speed.
 * - Standard (fast): Uses foot profile with offset waypoints for more turns through side streets.
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  
  // Standard: two offset waypoints to force zigzag through side streets
  const wp1 = getOffsetWaypoint(origin, destination, 0.25);
  const wp2 = getOffsetWaypoint(origin, destination, -0.15);
  const midLat = (origin[0] + destination[0]) / 2;
  const midLon = (origin[1] + destination[1]) / 2;
  // Place waypoints at 1/3 and 2/3 of the route
  const third1: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * 0.33 + (wp1[0] - midLat),
    origin[1] + (destination[1] - origin[1]) * 0.33 + (wp1[1] - midLon),
  ];
  const third2: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * 0.66 + (wp2[0] - midLat),
    origin[1] + (destination[1] - origin[1]) * 0.66 + (wp2[1] - midLon),
  ];
  const zigzagCoords = `${origin[1]},${origin[0]};${third1[1]},${third1[0]};${third2[1]},${third2[0]};${destination[1]},${destination[0]}`;

  const [safeRes, fastRes] = await Promise.all([
    // Zenit: car profile → main avenues, straight paths
    fetch(`${OSRM_BASE}/car/${directCoords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
    // Standard: foot profile with zigzag waypoints → side streets, more turns
    fetch(`${OSRM_BASE}/foot/${zigzagCoords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
  ]);

  let fast: RouteResult | null = null;
  let safe: RouteResult | null = null;

  if (safeRes?.code === 'Ok' && safeRes.routes?.length) {
    safe = parseOSRMRoute(safeRes.routes[0]);
  }

  if (fastRes?.code === 'Ok' && fastRes.routes?.length) {
    fast = parseOSRMRoute(fastRes.routes[0]);
  }

  // Fallback
  if (!safe && fast) safe = fast;
  if (!fast && safe) fast = safe;

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
