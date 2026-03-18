// OSRM routing via edge function proxy (avoids CORS)
import { supabase } from '@/integrations/supabase/client';
import { scoreLightingForRoute } from '@/lib/lightPoints';

const OSRM_FUNCTION = 'osrm-proxy';

async function fetchOSRM(profile: string, coordinates: string, params: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke(OSRM_FUNCTION, {
    body: { profile, coordinates, params },
  });
  if (error) throw error;
  return data;
}

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
 */
function totalAngularChange(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const step = Math.max(1, Math.floor(coords.length / 50));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) sampled.push(coords[i]);
  if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
    sampled.push(coords[coords.length - 1]);
  }
  let total = 0;
  for (let i = 1; i < sampled.length - 1; i++) {
    const [lat1, lon1] = sampled[i - 1];
    const [lat2, lon2] = sampled[i];
    const [lat3, lon3] = sampled[i + 1];
    const b1 = Math.atan2(lon2 - lon1, lat2 - lat1);
    const b2 = Math.atan2(lon3 - lon2, lat3 - lat2);
    let diff = Math.abs(b2 - b1) * (180 / Math.PI);
    if (diff > 180) diff = 360 - diff;
    total += diff;
  }
  return total;
}

function turnsPerKm(route: RouteResult): number {
  return totalAngularChange(route.coordinates) / (route.distance / 1000);
}

/**
 * Detect if a route backtracks (has loops/doubled segments).
 * Checks if the route visits nearly the same point twice.
 */
function hasBacktracking(coords: [number, number][]): boolean {
  if (coords.length < 10) return false;
  const step = Math.max(1, Math.floor(coords.length / 30));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) sampled.push(coords[i]);
  
  for (let i = 0; i < sampled.length; i++) {
    for (let j = i + 3; j < sampled.length; j++) {
      const dLat = Math.abs(sampled[i][0] - sampled[j][0]);
      const dLon = Math.abs(sampled[i][1] - sampled[j][1]);
      // ~15m threshold
      if (dLat < 0.00015 && dLon < 0.00015) return true;
    }
  }
  return false;
}

/**
 * Small perpendicular waypoint to nudge route onto parallel streets.
 * Only ONE waypoint at 40% of the way (not midpoint, to create asymmetric routes).
 */
function getNudgeWaypoint(
  origin: [number, number],
  destination: [number, number],
  offsetDeg: number
): [number, number] {
  const dLat = destination[0] - origin[0];
  const dLon = destination[1] - origin[1];
  const len = Math.sqrt(dLat * dLat + dLon * dLon);
  if (len === 0) return origin;
  
  // Point at 40% along the line
  const t = 0.4;
  const midLat = origin[0] + dLat * t;
  const midLon = origin[1] + dLon * t;
  
  // Perpendicular
  const perpLat = (-dLon / len) * offsetDeg;
  const perpLon = (dLat / len) * offsetDeg;
  
  return [midLat + perpLat, midLon + perpLon];
}

/**
 * Fetch two routes (both walking):
 * - Zenit (safe): OSRM car profile → main avenues, fewer turns, well-lit streets
 * - Standard (fast): OSRM foot profile → shortest walking path
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

  // Larger nudges for route variety on Zenit
  const dist = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
  );
  const nudge = Math.max(0.002, dist * 0.15);
  const wp1 = getNudgeWaypoint(origin, destination, nudge);
  const wp2 = getNudgeWaypoint(origin, destination, -nudge);
  const wpCoords1 = `${origin[1]},${origin[0]};${wp1[1]},${wp1[0]};${destination[1]},${destination[0]}`;
  const wpCoords2 = `${origin[1]},${origin[0]};${wp2[1]},${wp2[0]};${destination[1]},${destination[0]}`;

  // Fetch Zenit (car profile for main avenues) + Standard (foot profile) in parallel
  const [zenitDirectRes, wp1Res, wp2Res, footRes] = await Promise.all([
    fetchOSRM('car', directCoords, { overview: 'full', geometries: 'geojson', alternatives: '3' }).catch(() => null),
    fetchOSRM('car', wpCoords1, { overview: 'full', geometries: 'geojson', continue_straight: 'true' }).catch(() => null),
    fetchOSRM('car', wpCoords2, { overview: 'full', geometries: 'geojson', continue_straight: 'true' }).catch(() => null),
    fetchOSRM('foot', directCoords, { overview: 'full', geometries: 'geojson', alternatives: '2' }).catch(() => null),
  ]);

  // --- STANDARD (fast): OSRM foot profile — shortest direct path, shortcuts included ---
  let fast: RouteResult | null = null;
  if (footRes?.code === 'Ok' && footRes.routes?.length) {
    const footRoutes: RouteResult[] = footRes.routes.map((r: any) => parseOSRMRoute(r));
    fast = [...footRoutes].sort((a, b) => a.distance - b.distance)[0];
  }

  // Serialise the foot path to detect duplicates among Zenit candidates
  const footGeomKey = fast ? JSON.stringify(fast.coordinates) : '';

  // --- ZENIT (safe): nudged car routes through different (well-lit) streets ---
  // Only use waypointed candidates (wp1, wp2) so Zenit is always a distinct path
  // from the standard route. Falls back to direct car if no waypointed route exists.
  const wpCandidates: RouteResult[] = [];
  if (wp1Res?.code === 'Ok' && wp1Res.routes?.length) {
    wpCandidates.push(parseOSRMRoute(wp1Res.routes[0]));
  }
  if (wp2Res?.code === 'Ok' && wp2Res.routes?.length) {
    wpCandidates.push(parseOSRMRoute(wp2Res.routes[0]));
  }

  // Direct car route — used only as fallback when no waypointed route is available
  const directCarCandidates: RouteResult[] = [];
  if (zenitDirectRes?.code === 'Ok' && zenitDirectRes.routes?.length) {
    for (const route of zenitDirectRes.routes) directCarCandidates.push(parseOSRMRoute(route));
  }

  // Prefer waypointed candidates that differ from the foot route
  const differentWp = wpCandidates.filter(
    r => JSON.stringify(r.coordinates) !== footGeomKey && !hasBacktracking(r.coordinates)
  );
  const zenitPool = differentWp.length > 0
    ? differentWp
    : wpCandidates.filter(r => !hasBacktracking(r.coordinates));
  const fallbackPool = directCarCandidates.filter(r => !hasBacktracking(r.coordinates));
  const cleanZenit = zenitPool.length > 0 ? zenitPool : fallbackPool;

  // Score ALL candidates together (car/nudged + foot) so Zenit is always
  // the most illuminated option, regardless of profile.
  let safe: RouteResult | null = null;
  const allCandidates: RouteResult[] = [...cleanZenit];
  if (fast) allCandidates.push(fast); // include foot route in the pool

  if (allCandidates.length > 0) {
    const scores = await Promise.all(
      allCandidates.map(r => scoreLightingForRoute(r.coordinates).catch(() => ({ score: 0 })))
    );

    console.log('All candidates:', allCandidates.map((r, i) => ({
      distance: Math.round(r.distance) + 'm',
      lightScore: scores[i].score,
      isFoot: JSON.stringify(r.coordinates) === footGeomKey,
    })));

    // Sort all by illumination score; tie-break by fewest turns
    const ranked = allCandidates
      .map((r, i) => ({ route: r, score: scores[i].score, turns: turnsPerKm(r) }))
      .sort((a, b) => b.score - a.score || a.turns - b.turns);

    // Zenit = most illuminated route overall
    safe = ranked[0].route;
    console.log('Zenit selected: score=' + ranked[0].score + '% dist=' + Math.round(safe.distance) + 'm');

    // Standard = foot route if it didn't become Zenit; otherwise second-best candidate
    const safeKey = JSON.stringify(safe.coordinates);
    if (fast && JSON.stringify(fast.coordinates) !== safeKey) {
      // foot route is still available as Standard — keep fast as-is
    } else {
      // foot became Zenit → Standard = second-best distinct candidate
      const secondBest = ranked.find(c => JSON.stringify(c.route.coordinates) !== safeKey);
      fast = secondBest ? secondBest.route : (ranked[1]?.route ?? null);
    }
  }

  // Fallbacks
  if (!safe && fast) safe = { ...fast, duration: fast.duration * 1.15 };
  if (!fast && safe) fast = { ...safe, duration: safe.duration * 0.85 };

  console.log('Selected:', {
    zenit: safe ? Math.round(safe.distance) + 'm, ' + Math.round(safe.duration) + 's' : 'none',
    standard: fast ? `${Math.round(fast.distance)}m, ${Math.round(fast.duration)}s` : 'none',
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
