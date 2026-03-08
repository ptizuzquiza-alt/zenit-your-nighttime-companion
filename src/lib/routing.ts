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
 * Fetch two route types:
 * - Safe route: uses `car` profile → prefers main/wide streets, recalculated with walking speed
 * - Fast route: uses `foot` profile → shortest walking path through smaller streets
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  const [safeRes, fastRes] = await Promise.all([
    fetch(`${OSRM_BASE}/car/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
    fetch(`${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
  ]);

  let safe: RouteResult | null = null;
  let fast: RouteResult | null = null;

  if (safeRes?.code === 'Ok' && safeRes.routes?.length) {
    const parsed = parseOSRMRoute(safeRes.routes[0]);
    // Recalculate duration as walking time
    safe = { ...parsed, duration: parsed.distance / WALKING_SPEED };
  }

  if (fastRes?.code === 'Ok' && fastRes.routes?.length) {
    fast = parseOSRMRoute(fastRes.routes[0]);
  }

  return { safe, fast };
}

/** @deprecated Use fetchSafeAndFastRoutes instead */
export async function fetchWalkingRoute(
  origin: [number, number],
  destination: [number, number],
  alternative = false
): Promise<RouteResult[]> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  const url = `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&alternatives=${alternative}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return [];
    return data.routes.map(parseOSRMRoute);
  } catch (err) {
    console.error('Failed to fetch route:', err);
    return [];
  }
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
