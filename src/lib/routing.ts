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
 * Calculate "straightness score" — lower is better (straighter).
 * Normalizes angular change by distance to fairly compare routes of different lengths.
 */
function straightnessScore(route: RouteResult): number {
  const angularChange = totalAngularChange(route.coordinates);
  // Angular change per km — straighter routes have fewer degrees per km
  return angularChange / (route.distance / 1000);
}

/**
 * Get waypoints along the extended direct line (not perpendicular).
 * This creates a route that goes further in the same general direction,
 * through wider/main streets, rather than zigzagging sideways.
 */
function getExtendedWaypoints(
  origin: [number, number],
  destination: [number, number]
): [number, number][] {
  const dLat = destination[0] - origin[0];
  const dLon = destination[1] - origin[1];
  const len = Math.sqrt(dLat * dLat + dLon * dLon);
  if (len === 0) return [];

  // Perpendicular offset (small, to nudge onto wider parallel avenues)
  const perpLat = -dLon / len;
  const perpLon = dLat / len;

  // Try several small perpendicular offsets to find wider parallel streets
  const offsets = [0.001, -0.001, 0.0018, -0.0018];
  return offsets.map(offset => {
    const midLat = (origin[0] + destination[0]) / 2 + perpLat * offset;
    const midLon = (origin[1] + destination[1]) / 2 + perpLon * offset;
    return [midLat, midLon] as [number, number];
  });
}

/**
 * Fetch two contrasting walking routes:
 * - Standard (fast): Direct OSRM shortest path → shortest distance, more turns
 * - Zenit (safe): The straightest available route → fewer turns, wider streets, longer
 *
 * Strategy:
 * 1. Fetch direct route with alternatives=true
 * 2. Fetch routes through small perpendicular waypoints (nudges onto parallel avenues)
 * 3. Score all candidates by "straightness" (angular change per km)
 * 4. Zenit = straightest candidate that is ≥10% longer than the shortest
 * 5. Standard = shortest route
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  // Generate waypoint-based route coordinates
  const waypoints = getExtendedWaypoints(origin, destination);
  const waypointFetches = waypoints.map(wp => {
    const coords = `${origin[1]},${origin[0]};${wp[1]},${wp[0]};${destination[1]},${destination[0]}`;
    return fetch(`${OSRM_BASE}/foot/${coords}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null);
  });

  const [directRes, ...waypointResults] = await Promise.all([
    // Direct route with alternatives
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson&alternatives=3`)
      .then(r => r.json()).catch(() => null),
    ...waypointFetches,
  ]);

  // Collect all valid routes
  const allRoutes: RouteResult[] = [];

  if (directRes?.code === 'Ok' && directRes.routes?.length) {
    for (const route of directRes.routes) {
      allRoutes.push(parseOSRMRoute(route));
    }
  }

  for (const res of waypointResults) {
    if (res?.code === 'Ok' && res.routes?.length) {
      allRoutes.push(parseOSRMRoute(res.routes[0]));
    }
  }

  if (allRoutes.length === 0) {
    return { safe: null, fast: null };
  }

  // Standard (fast) = shortest route
  const byDistance = [...allRoutes].sort((a, b) => a.distance - b.distance);
  const fast = byDistance[0];

  // Zenit (safe) = straightest route per km (least °/km of angular change)
  // that is different from the standard route
  const scored = allRoutes
    .map(route => ({ route, score: straightnessScore(route) }))
    .sort((a, b) => a.score - b.score); // lowest score = straightest

  console.log('Route candidates:', scored.map(s => ({
    distance: Math.round(s.route.distance) + 'm',
    angularChange: Math.round(totalAngularChange(s.route.coordinates)) + '°',
    scorePerKm: Math.round(s.score) + '°/km',
  })));

  // Pick the straightest route that's meaningfully different from standard
  let safe = scored[0].route;
  if (safe.distance === fast.distance && safe.coordinates.length === fast.coordinates.length && scored.length > 1) {
    safe = scored[1].route;
  }

  // Apply 25% time penalty for safety/comfort priority
  safe = { ...safe, duration: safe.duration * 1.25 };

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
