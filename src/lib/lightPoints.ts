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
 * Count light points near a route to score illumination quality
 */
export async function scoreLightingForRoute(
  routeCoords: [number, number][]
): Promise<{ totalLights: number; lightsPerKm: number; score: number }> {
  const lights = await fetchLightPointsNearRoute(routeCoords, 0.0005); // ~50m buffer

  // Calculate route length in km
  let totalDist = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    const [lat1, lng1] = routeCoords[i - 1];
    const [lat2, lng2] = routeCoords[i];
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    totalDist += 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  const distKm = totalDist / 1000;

  const lightsPerKm = distKm > 0 ? lights.length / distKm : 0;

  // Score: 0-100 based on density (>40 lights/km = excellent)
  const score = Math.min(100, Math.round((lightsPerKm / 40) * 100));

  return { totalLights: lights.length, lightsPerKm: Math.round(lightsPerKm), score };
}
