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
 * Fetch two walking routes:
 * - Fast: foot profile → shortest walking path (small streets, shortcuts)
 * - Safe: bicycle profile geometry → prefers wider, main streets. Duration recalculated at walking speed.
 * This guarantees two visually different routes with different times.
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  const [footRes, bikeRes] = await Promise.all([
    fetch(`${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
    fetch(`${OSRM_BASE}/bicycle/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .catch(() => null),
  ]);

  let fast: RouteResult | null = null;
  let safe: RouteResult | null = null;

  // Fast route: foot profile (shortest path, small streets)
  if (footRes?.code === 'Ok' && footRes.routes?.length) {
    fast = parseOSRMRoute(footRes.routes[0]);
  }

  // Safe route: bicycle profile geometry (main/wide streets), walking duration
  if (bikeRes?.code === 'Ok' && bikeRes.routes?.length) {
    const bikeParsed = parseOSRMRoute(bikeRes.routes[0]);
    safe = { ...bikeParsed, duration: bikeParsed.distance / WALKING_SPEED };
  }

  // Fallback: if one is missing, duplicate the other
  if (!safe && fast) safe = fast;
  if (!fast && safe) fast = safe;

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
