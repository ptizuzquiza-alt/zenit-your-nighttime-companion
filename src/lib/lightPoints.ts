import { supabase } from '@/integrations/supabase/client';

export interface LightPoint {
  id: string;
  latitude: number;
  longitude: number;
  street_name: string | null;
  light_type: string | null;
  power_watts: number | null;
  district: string | null;
  neighborhood: string | null;
}

export interface DarkStreet {
  id: string;
  latitude: number;
  longitude: number;
  street_name: string | null;
  description: string | null;
  reported_at: string;
  upvotes: number;
}

// ─── Light Points ────────────────────────────────────────────────────────────

/**
 * Fetch all light points within a bounding box (for map display)
 */
export async function fetchLightPointsInBounds(
  minLat: number, maxLat: number,
  minLng: number, maxLng: number
): Promise<LightPoint[]> {
  const { data, error } = await supabase
    .from('light_points')
    .select('*')
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng);

  if (error) {
    console.error('Error fetching light points:', error);
    return [];
  }
  return (data || []) as LightPoint[];
}

/**
 * Fetch light points near a route (within buffer distance in degrees)
 */
export async function fetchLightPointsNearRoute(
  routeCoords: [number, number][],
  bufferDeg = 0.0015
): Promise<LightPoint[]> {
  if (routeCoords.length === 0) return [];

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of routeCoords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return fetchLightPointsInBounds(
    minLat - bufferDeg, maxLat + bufferDeg,
    minLng - bufferDeg, maxLng + bufferDeg
  );
}

// ─── Dark Streets ────────────────────────────────────────────────────────────

/**
 * Fetch all dark streets in a bounding box
 */
export async function fetchDarkStreetsInBounds(
  minLat: number, maxLat: number,
  minLng: number, maxLng: number
): Promise<DarkStreet[]> {
  const { data, error } = await supabase
    .from('dark_streets')
    .select('*')
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng);

  if (error) {
    console.error('Error fetching dark streets:', error);
    return [];
  }
  return (data || []) as DarkStreet[];
}

/**
 * Report a new dark street (anonymous crowdsourcing)
 */
export async function reportDarkStreet(
  latitude: number,
  longitude: number,
  streetName?: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('dark_streets')
    .insert({
      latitude,
      longitude,
      street_name: streetName || null,
      description: description || null,
    });

  if (error) {
    console.error('Error reporting dark street:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Upvote an existing dark street report (confirm it's still dark)
 */
export async function upvoteDarkStreet(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_dark_street_upvotes', { street_id: id });
  if (error) {
    // Fallback: fetch current + update manually
    const { data } = await supabase
      .from('dark_streets')
      .select('upvotes')
      .eq('id', id)
      .single();
    if (data) {
      await supabase
        .from('dark_streets')
        .update({ upvotes: data.upvotes + 1 })
        .eq('id', id);
    }
  }
  return true;
}

/**
 * Fetch dark streets near a route
 */
export async function fetchDarkStreetsNearRoute(
  routeCoords: [number, number][],
  bufferDeg = 0.002
): Promise<DarkStreet[]> {
  if (routeCoords.length === 0) return [];

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const [lat, lng] of routeCoords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return fetchDarkStreetsInBounds(
    minLat - bufferDeg, maxLat + bufferDeg,
    minLng - bufferDeg, maxLng + bufferDeg
  );
}

// ─── Route Scoring ───────────────────────────────────────────────────────────

/**
 * Count light points near a route to score illumination quality.
 * Uses per-segment proximity so parallel routes through different streets
 * receive genuinely different scores.
 * Also penalises routes that pass through user-reported dark streets.
 */
export async function scoreLightingForRoute(
  routeCoords: [number, number][]
): Promise<{ totalLights: number; lightsPerKm: number; score: number; darkPenalty: number }> {
  // Fetch lights and dark streets in parallel
  const [allLights, darkStreets] = await Promise.all([
    fetchLightPointsNearRoute(routeCoords, 0.002),
    fetchDarkStreetsNearRoute(routeCoords, 0.002),
  ]);

  // Sample the route every ~30 m
  const STEP_DEG = 0.00027;
  const sampled: [number, number][] = [];
  let accumulated = 0;
  sampled.push(routeCoords[0]);
  for (let i = 1; i < routeCoords.length; i++) {
    const [lat1, lng1] = routeCoords[i - 1];
    const [lat2, lng2] = routeCoords[i];
    const segLen = Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2);
    accumulated += segLen;
    if (accumulated >= STEP_DEG) {
      sampled.push(routeCoords[i]);
      accumulated = 0;
    }
  }
  sampled.push(routeCoords[routeCoords.length - 1]);

  // Count lights within ~40 m of any sampled point
  const LIGHT_BUFFER = 0.00040; // ~40 m
  const counted = new Set<string>();
  for (const light of allLights) {
    if (counted.has(light.id)) continue;
    for (const [lat, lng] of sampled) {
      if (
        Math.abs(light.latitude - lat) < LIGHT_BUFFER &&
        Math.abs(light.longitude - lng) < LIGHT_BUFFER
      ) {
        counted.add(light.id);
        break;
      }
    }
  }

  // Count dark street reports within ~60 m of any sampled point
  // Weight by upvotes so more-confirmed dark spots penalise more
  const DARK_BUFFER = 0.00060; // ~60 m
  let darkPenalty = 0;
  const hitDark = new Set<string>();
  for (const ds of darkStreets) {
    if (hitDark.has(ds.id)) continue;
    for (const [lat, lng] of sampled) {
      if (
        Math.abs(ds.latitude - lat) < DARK_BUFFER &&
        Math.abs(ds.longitude - lng) < DARK_BUFFER
      ) {
        hitDark.add(ds.id);
        darkPenalty += Math.min(ds.upvotes, 5); // cap at 5 per report
        break;
      }
    }
  }

  // Route length in km (Haversine)
  let totalDist = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    const [lat1, lng1] = routeCoords[i - 1];
    const [lat2, lng2] = routeCoords[i];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    totalDist += 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const distKm = totalDist / 1000;

  const lightsPerKm = distKm > 0 ? counted.size / distKm : 0;

  // Base score 0-100: ≥ 40 lights/km = 100%
  // Subtract dark penalty (each report = -5 points, capped so score ≥ 0)
  const rawScore = Math.min(100, Math.round((lightsPerKm / 40) * 100));
  const score = Math.max(0, rawScore - darkPenalty * 5);

  return { totalLights: counted.size, lightsPerKm: Math.round(lightsPerKm), score, darkPenalty };
}
