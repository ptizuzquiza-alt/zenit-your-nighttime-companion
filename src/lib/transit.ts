import { supabase } from '@/integrations/supabase/client';

export interface TransitLeg {
  mode: string; // 'WALK' | 'SUBWAY' | 'BUS' | 'TRAM' | 'RAIL'
  route: string; // line name e.g. "L3", "V15"
  routeColor: string;
  from: string;
  to: string;
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][];
  headsign?: string;
}

export interface TransitRouteResult {
  coordinates: [number, number][];
  distance: number;
  duration: number; // total seconds
  walkDistance: number;
  walkTime: number;
  transitTime: number;
  waitingTime: number;
  transfers: number;
  legs: TransitLeg[];
}

/** Decode Google-style encoded polyline (used by OpenTripPlanner/TMB) */
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

/** Map OTP mode strings to friendly names */
function getModeName(mode: string): string {
  const map: Record<string, string> = {
    WALK: 'Caminar',
    SUBWAY: 'Metro',
    BUS: 'Autobús',
    TRAM: 'Tranvía',
    RAIL: 'Tren',
    FERRY: 'Ferry',
  };
  return map[mode] || mode;
}

/**
 * Fetch transit route from TMB Planner API via edge function.
 * Returns the fastest itinerary combining walk + public transport.
 */
export async function fetchTransitRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<TransitRouteResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('tmb-planner', {
      body: {
        fromLat: origin[0],
        fromLon: origin[1],
        toLat: destination[0],
        toLon: destination[1],
      },
    });

    if (error) {
      console.error('TMB edge function error:', error);
      return null;
    }

    if (!data?.plan?.itineraries?.length) {
      console.warn('TMB: No itineraries found');
      return null;
    }

    // Pick the fastest itinerary
    const itineraries = data.plan.itineraries;
    const best = itineraries.reduce((a: any, b: any) =>
      a.duration < b.duration ? a : b
    );

    // Parse legs
    const legs: TransitLeg[] = best.legs.map((leg: any) => ({
      mode: leg.mode,
      route: leg.route || '',
      routeColor: leg.routeColor ? `#${leg.routeColor}` : '',
      from: leg.from?.name || '',
      to: leg.to?.name || '',
      distance: leg.distance || 0,
      duration: ((leg.endTime - leg.startTime) / 1000) || 0,
      coordinates: leg.legGeometry?.points
        ? decodePolyline(leg.legGeometry.points)
        : [],
      headsign: leg.headsign || undefined,
    }));

    // Combine all coordinates
    const allCoords: [number, number][] = [];
    for (const leg of legs) {
      allCoords.push(...leg.coordinates);
    }

    const totalDistance = legs.reduce((sum: number, l: TransitLeg) => sum + l.distance, 0);

    return {
      coordinates: allCoords,
      distance: totalDistance,
      duration: best.duration,
      walkDistance: best.walkDistance || 0,
      walkTime: best.walkTime || 0,
      transitTime: best.transitTime || 0,
      waitingTime: best.waitingTime || 0,
      transfers: best.transfers || 0,
      legs,
    };
  } catch (err) {
    console.error('TMB transit fetch failed:', err);
    return null;
  }
}
