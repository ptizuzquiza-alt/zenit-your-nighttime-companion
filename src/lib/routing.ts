// OSRM routing via edge function proxy (avoids CORS)
import { supabase } from '@/integrations/supabase/client';

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
  isTransit?: boolean;
  transitLegs?: import('./transit').TransitLeg[];
  transfers?: number;
  walkDistance?: number;
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
 * Fetch two routes:
 * - Zenit (safe): OSRM car profile → main avenues, fewer turns, well-lit streets
 * - Standard (fast): TMB transit (walk + public transport) for fastest travel
 *   Falls back to OSRM foot if TMB unavailable
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

  // Import transit module dynamically
  const { fetchTransitRoute } = await import('./transit');

  // Fetch Zenit (car profile for main avenues) + Standard (TMB transit) in parallel
  const [zenitDirectRes, wp1Res, wp2Res, transitResult, footFallbackRes] = await Promise.all([
    fetch(`${OSRM_BASE}/car/${directCoords}?overview=full&geometries=geojson&alternatives=3`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/car/${wpCoords1}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/car/${wpCoords2}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetchTransitRoute(origin, destination).catch(() => null),
    fetch(`${OSRM_BASE}/foot/${directCoords}?overview=full&geometries=geojson&alternatives=2`)
      .then(r => r.json()).catch(() => null),
  ]);

  // --- ZENIT (safe): car-profile routes for main avenues ---
  const zenitCandidates: RouteResult[] = [];
  if (zenitDirectRes?.code === 'Ok' && zenitDirectRes.routes?.length) {
    for (const route of zenitDirectRes.routes) zenitCandidates.push(parseOSRMRoute(route));
  }
  if (wp1Res?.code === 'Ok' && wp1Res.routes?.length) {
    zenitCandidates.push(parseOSRMRoute(wp1Res.routes[0]));
  }
  if (wp2Res?.code === 'Ok' && wp2Res.routes?.length) {
    zenitCandidates.push(parseOSRMRoute(wp2Res.routes[0]));
  }

  const cleanZenit = zenitCandidates.filter(r => !hasBacktracking(r.coordinates));

  console.log('Zenit candidates (car profile):', cleanZenit.map(r => ({
    distance: Math.round(r.distance) + 'm',
    turnsPerKm: Math.round(turnsPerKm(r)) + '°/km',
  })));

  // Zenit = straightest car-profile route
  let safe: RouteResult | null = null;
  if (cleanZenit.length > 0) {
    const sorted = [...cleanZenit].sort((a, b) => turnsPerKm(a) - turnsPerKm(b));
    safe = sorted[0];
  }

  // --- STANDARD (fast): TMB transit or OSRM foot fallback ---
  let fast: RouteResult | null = null;

  if (transitResult && transitResult.coordinates.length > 0) {
    // Use TMB transit route
    fast = {
      coordinates: transitResult.coordinates,
      distance: transitResult.distance,
      duration: transitResult.duration,
      isTransit: true,
      transitLegs: transitResult.legs,
      transfers: transitResult.transfers,
      walkDistance: transitResult.walkDistance,
    };
    console.log('Standard: Using TMB transit route', {
      duration: Math.round(transitResult.duration) + 's',
      transfers: transitResult.transfers,
      legs: transitResult.legs.map(l => `${l.mode} ${l.route}`).join(' → '),
    });
  } else {
    // Fallback to OSRM foot
    console.warn('TMB transit unavailable, falling back to OSRM foot');
    const footCandidates: RouteResult[] = [];
    if (footFallbackRes?.code === 'Ok' && footFallbackRes.routes?.length) {
      for (const route of footFallbackRes.routes) footCandidates.push(parseOSRMRoute(route));
    }
    const cleanFoot = footCandidates.filter(r => !hasBacktracking(r.coordinates));
    if (cleanFoot.length > 0) {
      fast = [...cleanFoot].sort((a, b) => a.distance - b.distance)[0];
    }
  }

  // Fallbacks
  if (!safe && fast) safe = { ...fast, duration: fast.duration * 1.15 };
  if (!fast && safe) fast = { ...safe, duration: safe.duration * 0.85 };

  console.log('Selected:', {
    zenit: safe ? Math.round(safe.distance) + 'm, ' + Math.round(safe.duration) + 's' : 'none',
    standard: fast ? `${Math.round(fast.distance)}m, ${Math.round(fast.duration)}s${fast.isTransit ? ' (transit)' : ''}` : 'none',
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
