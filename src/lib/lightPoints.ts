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
  bufferDeg = 0.0015 // ~150m
): Promise<LightPoint[]> {
  if (routeCoords.length === 0) return [];

  // Get bounding box of route + buffer
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

/**
 * Count light points near a route to score illumination quality.
 * Uses per-segment proximity (not bounding-box) so two parallel routes
 * through different streets receive genuinely different scores.
 */
export async function scoreLightingForRoute(
  routeCoords: [number, number][]
): Promise<{ totalLights: number; lightsPerKm: number; score: number }> {
  // 1. Fetch all lights in a generous bounding box around the route
  const allLights = await fetchLightPointsNearRoute(routeCoords, 0.002); // ~200m broad fetch

  // 2. Sample the route at one point every ~30 m (degree ≈ 111 km → 30 m ≈ 0.00027°)
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

  // 3. For each light, check if it is within ~40 m of any sampled point
  const BUFFER = 0.00040; // ~40 m in degrees
  const counted = new Set<string>();
  for (const light of allLights) {
    if (counted.has(light.id)) continue;
    for (const [lat, lng] of sampled) {
      if (
        Math.abs(light.latitude - lat) < BUFFER &&
        Math.abs(light.longitude - lng) < BUFFER
      ) {
        counted.add(light.id);
        break;
      }
    }
  }

  // 4. Route length in km (Haversine)
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

  // Score 0-100: ≥ 40 lights/km = 100 %
  const score = Math.min(100, Math.round((lightsPerKm / 40) * 100));

  return { totalLights: counted.size, lightsPerKm: Math.round(lightsPerKm), score };
}
