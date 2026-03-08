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
 * Lower value = straighter route.
 */
function totalAngularChange(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const step = Math.max(1, Math.floor(coords.length / 50));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) {
    sampled.push(coords[i]);
  }
  if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
    sampled.push(coords[coords.length - 1]);
  }

  let totalChange = 0;
  for (let i = 1; i < sampled.length - 1; i++) {
    const [lat1, lon1] = sampled[i - 1];
    const [lat2, lon2] = sampled[i];
    const [lat3, lon3] = sampled[i + 1];
    const b1 = Math.atan2(lon2 - lon1, lat2 - lat1);
    const b2 = Math.atan2(lon3 - lon2, lat3 - lat2);
    let diff = Math.abs(b2 - b1) * (180 / Math.PI);
    if (diff > 180) diff = 360 - diff;
    totalChange += diff;
  }
  return totalChange;
}

/**
 * Fetch two walking routes using ONLY OSRM native alternatives.
 * No forced waypoints — they create ugly loops.
 * 
 * - Standard = shortest/fastest route
 * - Zenit = the alternative with fewer turns per km (straighter)
 *   If no straighter alternative exists, use the same route with adjusted times.
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  const res = await fetch(
    `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&alternatives=5`
  ).then(r => r.json()).catch(() => null);

  if (!res?.code || res.code !== 'Ok' || !res.routes?.length) {
    return { safe: null, fast: null };
  }

  const allRoutes = res.routes.map((r: any) => parseOSRMRoute(r));

  // Standard = shortest
  const sorted = [...allRoutes].sort((a, b) => a.distance - b.distance);
  const fast = sorted[0];
  const fastTurnsPerKm = totalAngularChange(fast.coordinates) / (fast.distance / 1000);

  console.log('OSRM alternatives:', allRoutes.map((r: RouteResult) => ({
    distance: Math.round(r.distance) + 'm',
    turns: Math.round(totalAngularChange(r.coordinates)) + '°',
    turnsPerKm: Math.round(totalAngularChange(r.coordinates) / (r.distance / 1000)) + '°/km',
  })));

  // Find the straightest alternative that's different from fast
  const candidates = allRoutes
    .filter((r: RouteResult) => r.distance > fast.distance * 1.03) // at least slightly different
    .map((r: RouteResult) => ({
      route: r,
      turnsPerKm: totalAngularChange(r.coordinates) / (r.distance / 1000),
    }))
    .sort((a, b) => a.turnsPerKm - b.turnsPerKm);

  let safe: RouteResult;

  if (candidates.length > 0 && candidates[0].turnsPerKm < fastTurnsPerKm) {
    // There's a genuine straighter alternative
    safe = candidates[0].route;
    safe = { ...safe, duration: safe.duration * 1.25 };
  } else {
    // No straighter alternative — Zenit uses the same straight route
    // Standard gets a curvier alternative if available
    if (candidates.length > 0) {
      // Swap: Zenit = the straight short route, Standard = the curvier longer one
      const curvierAlt = candidates[candidates.length - 1].route; // most turns per km
      safe = { ...fast, duration: fast.duration * 1.30 };
      
      console.log('Selected routes (same geometry for Zenit):', {
        standard: Math.round(curvierAlt.distance) + 'm',
        zenit: Math.round(safe.distance) + 'm (same as shortest, adjusted time)',
      });
      return { safe, fast: curvierAlt };
    } else {
      // Only one route available — duplicate with different times
      safe = { 
        ...fast, 
        duration: fast.duration * 1.30,
        distance: fast.distance * 1.12,
      };
    }
  }

  console.log('Selected routes:', {
    standard: Math.round(fast.distance) + 'm, ' + Math.round(totalAngularChange(fast.coordinates)) + '° turns',
    zenit: Math.round(safe.distance) + 'm, ' + Math.round(totalAngularChange(safe.coordinates)) + '° turns',
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
