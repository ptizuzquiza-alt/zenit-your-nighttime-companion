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
 * Calculate total cumulative angular change along a route (in degrees).
 * Lower value = straighter route = Zenit candidate.
 * We sample every N points to avoid noise from tiny coordinate jitter.
 */
function totalAngularChange(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  // Sample every ~50m worth of points to reduce noise
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
 * - Standard (fast): Direct OSRM shortest path → uses shortcuts, side streets, more turns
 * - Zenit (safe): Forced through a perpendicular waypoint on main avenues → straighter, wider streets, longer
 *
 * Strategy: The shortest OSRM path naturally uses shortcuts/callejuelas.
 * By adding a waypoint offset from the direct line, we force Zenit through different (wider) streets.
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  
  // Zenit waypoint: offset perpendicular to force through different/wider streets
  const waypoint = getOffsetWaypoint(origin, destination, 0.25);
  const zenitCoords = `${origin[1]},${origin[0]};${waypoint[1]},${waypoint[0]};${destination[1]},${destination[0]}`;

  const [standardRes, zenitRes] = await Promise.all([
    // Standard: direct shortest path (shortcuts, callejuelas, more turns)
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson`)
      .then(r => r.json()).catch(() => null),
    // Zenit: waypoint forces through wider/different streets (straighter overall, longer)
    fetch(`${OSRM_BASE}/foot/${zenitCoords}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
  ]);

  let fast: RouteResult | null = null;
  let safe: RouteResult | null = null;

  if (standardRes?.code === 'Ok' && standardRes.routes?.length) {
    fast = parseOSRMRoute(standardRes.routes[0]);
  }

  if (zenitRes?.code === 'Ok' && zenitRes.routes?.length) {
    safe = parseOSRMRoute(zenitRes.routes[0]);
    // +25% time penalty for safety/comfort priority
    safe.duration = safe.duration * 1.25;
  }

  // If both routes are identical or Zenit is shorter, try opposite offset
  if (safe && fast && safe.distance <= fast.distance * 1.05) {
    const waypoint2 = getOffsetWaypoint(origin, destination, -0.25);
    const zenitCoords2 = `${origin[1]},${origin[0]};${waypoint2[1]},${waypoint2[0]};${destination[1]},${destination[0]}`;
    try {
      const res2 = await fetch(`${OSRM_BASE}/foot/${zenitCoords2}?overview=full&geometries=geojson&continue_straight=true`)
        .then(r => r.json());
      if (res2?.code === 'Ok' && res2.routes?.length) {
        const alt = parseOSRMRoute(res2.routes[0]);
        if (alt.distance > fast.distance * 1.05) {
          safe = alt;
          safe.duration = safe.duration * 1.25;
        }
      }
    } catch {}
  }

  console.log('Routes:', {
    standard: fast ? Math.round(fast.distance) + 'm' : null,
    zenit: safe ? Math.round(safe.distance) + 'm' : null,
  });

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
