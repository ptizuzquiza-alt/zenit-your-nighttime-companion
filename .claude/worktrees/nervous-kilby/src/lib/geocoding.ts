// Nominatim (OpenStreetMap) geocoding API - free, no API key required
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance?: string;
}

/**
 * Search for places using Nominatim
 * @param query Search text
 * @param userLat User latitude for distance calculation (optional)
 * @param userLon User longitude for distance calculation (optional)
 */
export async function searchPlaces(
  query: string,
  userLat?: number,
  userLon?: number
): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '8',
      viewbox: '2.0524,41.4620,2.2280,41.3200',
      bounded: '1',
    });

    const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: {
        'Accept-Language': 'es',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();

    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      // Calculate distance if user position is available
      let distance: string | undefined;
      if (userLat !== undefined && userLon !== undefined) {
        const d = haversineDistance(userLat, userLon, lat, lon);
        distance = d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
      }

      return {
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0],
        address: item.display_name,
        lat,
        lon,
        distance,
      };
    });
  } catch (err) {
    console.error('Geocoding search failed:', err);
    return [];
  }
}

/** Calculate distance between two coordinates in km using Haversine formula */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Store selected destination in sessionStorage */
export function storeDestination(dest: { name: string; lat: number; lon: number }) {
  sessionStorage.setItem('zenit_destination', JSON.stringify(dest));
}

/** Retrieve selected destination from sessionStorage */
export function getStoredDestination(): { name: string; lat: number; lon: number } | null {
  const data = sessionStorage.getItem('zenit_destination');
  return data ? JSON.parse(data) : null;
}

/** Store custom origin in sessionStorage */
export function storeOrigin(origin: { name: string; lat: number; lon: number }) {
  sessionStorage.setItem('zenit_origin', JSON.stringify(origin));
}

/** Clear custom origin (revert to geolocation) */
export function clearOrigin() {
  sessionStorage.removeItem('zenit_origin');
}

/** Retrieve custom origin from sessionStorage */
export function getStoredOrigin(): { name: string; lat: number; lon: number } | null {
  const data = sessionStorage.getItem('zenit_origin');
  return data ? JSON.parse(data) : null;
}
