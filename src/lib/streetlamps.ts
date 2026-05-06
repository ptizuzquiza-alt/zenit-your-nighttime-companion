const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export interface StreetLamp {
  lat: number;
  lon: number;
}

/**
 * Fetch street lamp positions within a bounding box from the Supabase
 * light_points table (real Barcelona illumination data).
 */
export async function fetchStreetLamps(
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number
): Promise<StreetLamp[]> {
  try {
    const params = new URLSearchParams({
      select: 'latitude,longitude',
      latitude: `gte.${minLat}`,
      longitude: `gte.${minLon}`,
    });

    // Supabase REST API supports multiple filters via query params
    const url =
      `${SUPABASE_URL}/rest/v1/light_points` +
      `?select=latitude,longitude` +
      `&latitude=gte.${minLat}&latitude=lte.${maxLat}` +
      `&longitude=gte.${minLon}&longitude=lte.${maxLon}` +
      `&limit=3000`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    const data: { latitude: number; longitude: number }[] = await res.json();
    return data.map((d) => ({ lat: d.latitude, lon: d.longitude }));
  } catch (err) {
    console.warn('Light points fetch failed, proceeding without lighting data', err);
    return [];
  }
}

/**
 * Score a route by how many street lamps are within 30m of its path.
 * Higher = better lit. Returns value between 0 and 1.
 */
export function scoreLighting(
  coords: [number, number][],
  lamps: StreetLamp[]
): number {
  if (lamps.length === 0 || coords.length === 0) return 0;

  // Sample route points (max 60 points for performance)
  const step = Math.max(1, Math.floor(coords.length / 60));
  const sampled: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) sampled.push(coords[i]);

  // ~30m in degrees latitude
  const THRESHOLD = 0.00027;

  let count = 0;
  for (const [lat, lon] of sampled) {
    for (const lamp of lamps) {
      const dLat = Math.abs(lat - lamp.lat);
      const dLon = Math.abs(lon - lamp.lon);
      if (dLat < THRESHOLD && dLon < THRESHOLD) {
        count++;
        break; // count each route point once
      }
    }
  }

  return count / sampled.length;
}

/**
 * Get the bounding box for a set of coordinates, with padding.
 */
export function getBoundingBox(
  coords: [number, number][][],
  paddingDeg = 0.003
): { minLat: number; minLon: number; maxLat: number; maxLon: number } {
  let minLat = Infinity, minLon = Infinity, maxLat = -Infinity, maxLon = -Infinity;
  for (const route of coords) {
    for (const [lat, lon] of route) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
  }
  return {
    minLat: minLat - paddingDeg,
    minLon: minLon - paddingDeg,
    maxLat: maxLat + paddingDeg,
    maxLon: maxLon + paddingDeg,
  };
}
