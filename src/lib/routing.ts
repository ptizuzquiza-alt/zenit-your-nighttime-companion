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

export type TransportMode = 'foot' | 'metro' | 'bus' | 'car';

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  isTransit?: boolean;
  transitLegs?: import('./transit').TransitLeg[];
  transfers?: number;
  walkDistance?: number;
  primaryMode?: TransportMode;
  variant?: 'safe' | 'fast';
  safetyScore?: number; // 0–100 heuristic score
}

function parseOSRMRoute(route: any, useRealDuration = false): RouteResult {
  return {
    coordinates: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    ),
    distance: route.distance,
    duration: useRealDuration ? route.duration : route.distance / WALKING_SPEED,
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

/** Compute geometry-based safety score (0–100). Lower turnsPerKm → higher score. */
function geometrySafetyScore(route: RouteResult, allCandidates: RouteResult[]): number {
  if (allCandidates.length === 0) return 82;
  const turns = allCandidates.map(turnsPerKm);
  const maxT = Math.max(...turns);
  const minT = Math.min(...turns);
  const range = maxT - minT;
  if (range === 0) return 82;
  return Math.round(68 + 24 * (1 - (turnsPerKm(route) - minT) / range));
}

/** Compute transit safety score (0–100) based on preferred-mode leg ratio. */
function transitSafetyScore(
  legs: import('./transit').TransitLeg[],
  preferredMode: 'SUBWAY' | 'BUS'
): number {
  const preferredTime = legs
    .filter(l => l.mode === preferredMode)
    .reduce((sum, l) => sum + l.duration, 0);
  const totalTransitTime = legs
    .filter(l => l.mode !== 'WALK')
    .reduce((sum, l) => sum + l.duration, 0);
  const ratio = totalTransitTime > 0 ? preferredTime / totalTransitTime : 0;
  return Math.round(72 + 18 * ratio);
}

/** Fetch OSRM route candidates for a given profile (foot or car). */
async function fetchOSRMCandidates(
  origin: [number, number],
  destination: [number, number],
  profile: 'foot' | 'car'
): Promise<RouteResult[]> {
  const directCoords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
  const dist = Math.sqrt(
    Math.pow(destination[0] - origin[0], 2) + Math.pow(destination[1] - origin[1], 2)
  );
  const nudge = Math.max(0.002, dist * 0.15);
  const wp1 = getNudgeWaypoint(origin, destination, nudge);
  const wp2 = getNudgeWaypoint(origin, destination, -nudge);
  const wpCoords1 = `${origin[1]},${origin[0]};${wp1[1]},${wp1[0]};${destination[1]},${destination[0]}`;
  const wpCoords2 = `${origin[1]},${origin[0]};${wp2[1]},${wp2[0]};${destination[1]},${destination[0]}`;
  const useDuration = profile === 'car';

  const [directRes, wp1Res, wp2Res] = await Promise.all([
    fetch(`${OSRM_BASE}/${profile}/${directCoords}?overview=full&geometries=geojson&alternatives=3`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/${profile}/${wpCoords1}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
    fetch(`${OSRM_BASE}/${profile}/${wpCoords2}?overview=full&geometries=geojson&continue_straight=true`)
      .then(r => r.json()).catch(() => null),
  ]);

  const candidates: RouteResult[] = [];
  if (directRes?.code === 'Ok') {
    for (const r of directRes.routes ?? []) candidates.push(parseOSRMRoute(r, useDuration));
  }
  if (wp1Res?.code === 'Ok' && wp1Res.routes?.length) {
    candidates.push(parseOSRMRoute(wp1Res.routes[0], useDuration));
  }
  if (wp2Res?.code === 'Ok' && wp2Res.routes?.length) {
    candidates.push(parseOSRMRoute(wp2Res.routes[0], useDuration));
  }
  return candidates.filter(r => !hasBacktracking(r.coordinates));
}

/**
 * From a set of OSRM candidates build a safe/fast pair:
 * - Zenit (safe): straightest route (lowest turnsPerKm ≈ main streets)
 * - Standard (fast): shortest duration
 */
function buildOSRMPair(
  candidates: RouteResult[],
  mode: TransportMode
): { safe: RouteResult | null; fast: RouteResult | null } {
  if (candidates.length === 0) return { safe: null, fast: null };
  const bySafety = [...candidates].sort((a, b) => turnsPerKm(a) - turnsPerKm(b));
  const bySpeed  = [...candidates].sort((a, b) => a.duration - b.duration);
  const safe: RouteResult = {
    ...bySafety[0],
    primaryMode: mode,
    variant: 'safe',
    safetyScore: geometrySafetyScore(bySafety[0], candidates),
  };
  const fast: RouteResult = {
    ...bySpeed[0],
    primaryMode: mode,
    variant: 'fast',
    safetyScore: geometrySafetyScore(bySpeed[0], candidates),
  };
  return { safe, fast };
}

/**
 * Fetch a safe/fast pair for transit modes (metro or bus).
 * Zenit uses the preferred transit mode; Standard uses the fastest unrestricted route.
 */
async function fetchTransitModePair(
  origin: [number, number],
  destination: [number, number],
  preferredOTPMode: 'SUBWAY' | 'BUS'
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  const { fetchTransitRoute } = await import('./transit');
  const primaryMode: TransportMode = preferredOTPMode === 'SUBWAY' ? 'metro' : 'bus';

  // Zenit: preferred mode + walking; Standard: unrestricted fastest transit
  const [preferredResult, standardResult] = await Promise.all([
    fetchTransitRoute(origin, destination, `${preferredOTPMode},WALK`).catch(() => null),
    fetchTransitRoute(origin, destination, 'TRANSIT,WALK').catch(() => null),
  ]);

  const zenitSource = preferredResult ?? standardResult;
  const fastSource  = standardResult ?? preferredResult;

  const safe: RouteResult | null = zenitSource ? {
    coordinates:  zenitSource.coordinates,
    distance:     zenitSource.distance,
    duration:     zenitSource.duration,
    isTransit:    true,
    transitLegs:  zenitSource.legs,
    transfers:    zenitSource.transfers,
    walkDistance: zenitSource.walkDistance,
    primaryMode,
    variant:      'safe',
    safetyScore:  transitSafetyScore(zenitSource.legs, preferredOTPMode),
  } : null;

  const fast: RouteResult | null = fastSource ? {
    coordinates:  fastSource.coordinates,
    distance:     fastSource.distance,
    duration:     fastSource.duration,
    isTransit:    true,
    transitLegs:  fastSource.legs,
    transfers:    fastSource.transfers,
    walkDistance: fastSource.walkDistance,
    primaryMode,
    variant:      'fast',
    safetyScore:  transitSafetyScore(fastSource.legs, preferredOTPMode),
  } : null;

  return { safe, fast };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch two routes for the selected primary transport mode:
 * - Zenit (safe): safest available route for that mode (main streets / preferred transit)
 * - Standard (fast): fastest available route for that mode
 *
 *   foot  → OSRM walking; Zenit = straightest path,     Standard = shortest duration
 *   car   → OSRM driving; Zenit = main-avenue (low turns), Standard = fastest drive
 *   metro → Transit+walk; Zenit prefers SUBWAY legs,    Standard = fastest overall
 *   bus   → Transit+walk; Zenit prefers BUS legs,       Standard = fastest overall
 */
export async function fetchSafeAndFastRoutes(
  origin: [number, number],
  destination: [number, number],
  primaryMode: TransportMode = 'foot'
): Promise<{ safe: RouteResult | null; fast: RouteResult | null }> {
  let result: { safe: RouteResult | null; fast: RouteResult | null };

  if (primaryMode === 'foot') {
    const candidates = await fetchOSRMCandidates(origin, destination, 'foot');
    result = buildOSRMPair(candidates, 'foot');
  } else if (primaryMode === 'car') {
    const candidates = await fetchOSRMCandidates(origin, destination, 'car');
    result = buildOSRMPair(candidates, 'car');
  } else {
    const otpMode = primaryMode === 'metro' ? 'SUBWAY' : 'BUS';
    result = await fetchTransitModePair(origin, destination, otpMode);
  }

  // Mutual fallback if one variant is missing
  if (!result.safe && result.fast) {
    result.safe = { ...result.fast, variant: 'safe', duration: result.fast.duration * 1.1 };
  }
  if (!result.fast && result.safe) {
    result.fast = { ...result.safe, variant: 'fast', duration: result.safe.duration * 0.9 };
  }

  console.log(`[Routes] mode=${primaryMode}`, {
    zenit:    result.safe ? `${Math.round(result.safe.distance)}m ${Math.round(result.safe.duration)}s score=${result.safe.safetyScore}` : 'none',
    standard: result.fast ? `${Math.round(result.fast.distance)}m ${Math.round(result.fast.duration)}s score=${result.fast.safetyScore}` : 'none',
  });

  return result;
}

/** Store the selected route in sessionStorage for cross-page use. */
export function storeSelectedRoute(route: RouteResult) {
  sessionStorage.setItem('zenit_selected_route', JSON.stringify(route));
}

/** Store the selected primary transport mode in sessionStorage. */
export function storeSelectedMode(mode: TransportMode) {
  sessionStorage.setItem('zenit_selected_transport_mode', mode);
}

/** Retrieve the selected route from sessionStorage. */
export function getStoredRoute(): RouteResult | null {
  const data = sessionStorage.getItem('zenit_selected_route');
  return data ? JSON.parse(data) : null;
}

/** Retrieve the selected primary transport mode from sessionStorage. */
export function getStoredMode(): TransportMode {
  return (sessionStorage.getItem('zenit_selected_transport_mode') as TransportMode) ?? 'foot';
}
