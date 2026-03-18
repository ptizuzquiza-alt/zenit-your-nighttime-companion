// Overpass API — fetches street lamp nodes from OpenStreetMap
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export interface StreetLamp {
  lat: number;
  lon: number;
}

/**
 * Fetch all street lamp positions within a bounding box from OpenStreetMap.
 * Uses highway=street_lamp tag.
 */
export async function fetchStreetLamps(
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number
): Promise<StreetLamp[]> {
  const query = `
    [out:json][timeout:10];
    node["highway"="street_lamp"](${minLat},${minLon},${maxLat},${maxLon});
    out body;
  `;

  try {
    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = await res.json();
    return (data.elements || []).map((el: any) => ({ lat: el.lat, lon: el.lon }));
  } catch {
    console.warn('Street lamp fetch failed, proceeding without lighting data');
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

  // Return percentage of route points near a lamp
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
