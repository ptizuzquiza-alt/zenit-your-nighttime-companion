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
 * Count significant turns (direction changes > threshold degrees) in a route.
 * Fewer turns = straighter route = Zenit candidate.
 */
function countSignificantTurns(coords: [number, number][], thresholdDeg: number = 30): number {
  if (coords.length < 3) return 0;
  let turns = 0;
  for (let i = 1; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i - 1];
    const [lat2, lon2] = coords[i];
    const [lat3, lon3] = coords[i + 1];
    // Bearing from point i-1 to i
    const b1 = Math.atan2(lon2 - lon1, lat2 - lat1);
    // Bearing from point i to i+1
    const b2 = Math.atan2(lon3 - lon2, lat3 - lat2);
    let diff = Math.abs(b2 - b1) * (180 / Math.PI);
    if (diff > 180) diff = 360 - diff;
    if (diff > thresholdDeg) turns++;
  }
  return turns;
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
 * - Zenit (safe): Wide streets, few turns, very straight, usually longer
 * - Standard (fast): Shortcuts, side streets, fastest with more turns
 *
 * Strategy: Request alternatives=true to get multiple routes from OSRM.
 * Pick the LONGEST for Zenit (straighter, main avenues) and SHORTEST for Standard (shortcuts).
 * If only one route returned, use a waypoint detour to force a second distinct route.
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  // Single request with alternatives — gives us 2+ different routes
  const res = await fetch(
    `${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&alternatives=true&continue_straight=true`
  ).then(r => r.json()).catch(() => null);

  let safe: RouteResult | null = null;
  let fast: RouteResult | null = null;

  if (res?.code === 'Ok' && res.routes?.length) {
    const allRoutes = res.routes.map(parseOSRMRoute);

    if (allRoutes.length >= 2) {
      // Sort by number of significant turns: fewest turns first = straightest
      allRoutes.sort((a: RouteResult, b: RouteResult) => 
        countSignificantTurns(a.coordinates) - countSignificantTurns(b.coordinates)
      );
      safe = allRoutes[0]; // fewest turns = Zenit (calles amplias, recto)
      fast = allRoutes[allRoutes.length - 1]; // most turns = Standard (atajos, callejuelas)
      console.log('Route turns:', allRoutes.map(r => ({
        turns: countSignificantTurns(r.coordinates),
        distance: Math.round(r.distance),
      })));
    } else {
      fast = allRoutes[0];
    }
  }

  // If we don't have two distinct routes, force a detour for the safe route
  if (fast && !safe) {
    const waypoint = getOffsetWaypoint(origin, destination, 0.3);
    const detourCoords = `${origin[1]},${origin[0]};${waypoint[1]},${waypoint[0]};${destination[1]},${destination[0]}`;
    try {
      const detourRes = await fetch(
        `${OSRM_BASE}/foot/${detourCoords}?overview=full&geometries=geojson`
      ).then(r => r.json());
      if (detourRes?.code === 'Ok' && detourRes.routes?.length) {
        safe = parseOSRMRoute(detourRes.routes[0]);
      }
    } catch {}
  }

  // Apply Zenit time penalty (+25% for prioritizing safety/comfort)
  if (safe) {
    safe.duration = safe.duration * 1.25;
  }

  // No longer swap based on distance — Zenit is chosen by fewest turns, not longest distance

  // Fallback
  if (!safe && fast) safe = { ...fast, duration: fast.duration * 1.25 };
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
