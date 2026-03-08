// OSRM public API for real street routing (walking profile)
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/foot';

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
}

/**
 * Fetch a real walking route between two points using OSRM.
 * Returns decoded coordinates that follow real streets.
 * @param origin [lat, lng]
 * @param destination [lat, lng]
 * @param alternative whether to request an alternative route
 */
export async function fetchWalkingRoute(
  origin: [number, number],
  destination: [number, number],
  alternative = false
): Promise<RouteResult[]> {
  // OSRM uses lng,lat order
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&alternatives=${alternative}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      console.warn('OSRM routing failed:', data);
      return [];
    }

    return data.routes.map((route: any) => ({
      // GeoJSON is [lng, lat], convert to [lat, lng] for Leaflet
      coordinates: route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      ),
      distance: route.distance,
      duration: route.duration,
    }));
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
