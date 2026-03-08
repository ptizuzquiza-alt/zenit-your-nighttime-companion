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
 * - Fast: shortest foot route (takes shortcuts through small streets)
 * - Safe: alternative foot route (tends to use bigger, more main streets)
 * Uses OSRM foot profile with alternatives=true
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  const url = `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&alternatives=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      console.warn('OSRM routing failed:', data);
      return { safe: null, fast: null };
    }

    const parsed = data.routes.map(parseOSRMRoute);

    // First route = fastest/shortest (small streets, shortcuts)
    const fast = parsed[0];

    // Second route = alternative (longer, bigger streets) — if available
    // If only one route, create a "safe" variant by using the same route
    const safe = parsed.length > 1 ? parsed[1] : null;

    // If no alternative, try to get one via bicycle profile (prefers bigger roads)
    if (!safe) {
      try {
        const bikeRes = await fetch(`${OSRM_BASE}/bicycle/${coords}?overview=full&geometries=geojson`);
        const bikeData = await bikeRes.json();
        if (bikeData?.code === 'Ok' && bikeData.routes?.length) {
          const bikeParsed = parseOSRMRoute(bikeData.routes[0]);
          // Recalculate with walking speed since it's a bike route geometry
          return {
            safe: { ...bikeParsed, duration: bikeParsed.distance / WALKING_SPEED },
            fast,
          };
        }
      } catch { /* fallback below */ }
      
      // Last resort: return the same route for both
      return { safe: fast, fast };
    }

    return { safe, fast };
  } catch (err) {
    console.error('Failed to fetch routes:', err);
    return { safe: null, fast: null };
  }
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
