import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dark map style tiles (CartoDB Dark Matter)
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

interface FriendRoute {
  name: string;
  coordinates: [number, number][];
  position: [number, number];
}

interface ZenitMapProps {
  center?: [number, number];
  zoom?: number;
  origin?: [number, number];
  destination?: [number, number];
  route?: [number, number][];
  alternativeRoute?: [number, number][];
  selectedRoute?: 'safe' | 'fast';
  friendLocations?: [number, number][];
  friendRoutes?: FriendRoute[];
  showUserArrow?: boolean;
  userPosition?: [number, number];
  fitToRoute?: boolean;
  focusBounds?: [number, number][];
  className?: string;
}

export const ZenitMap: FC<ZenitMapProps> = ({
  center = [41.4036, 2.1744],
  zoom = 15,
  origin,
  destination,
  route,
  alternativeRoute,
  selectedRoute = 'safe',
  friendLocations = [],
  friendRoutes = [],
  showUserArrow = false,
  userPosition,
  fitToRoute = false,
  className = '',
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const prevFitToRouteRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(DARK_TILE_URL).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update view: fit to route bounds when fitToRoute is active and routes change
  useEffect(() => {
    if (!mapRef.current) return;

    if (fitToRoute && route && route.length > 1) {
      const bounds = L.latLngBounds(route);
      if (alternativeRoute && alternativeRoute.length > 1) {
        alternativeRoute.forEach(pt => bounds.extend(pt));
      }
      if (origin) bounds.extend(origin);
      if (destination) bounds.extend(destination);
      // Large bottom padding to keep routes visible above the bottom sheet
      mapRef.current.fitBounds(bounds, { paddingTopLeft: [40, 60], paddingBottomRight: [40, 450], maxZoom: 15, animate: true });
    } else if (!fitToRoute) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, route, alternativeRoute, fitToRoute, origin, destination]);

  // Update markers and routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.remove());
    polylinesRef.current = [];

    const safeSelected = selectedRoute === 'safe';

    // Helper: draw Ruta Estándar (lila)
    const drawStandard = () => {
      if (!alternativeRoute || alternativeRoute.length < 2) return;
      if (!safeSelected) {
        const glow = L.polyline(alternativeRoute, {
          color: '#a78bfa', weight: 12, opacity: 0.25, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(glow);
        const main = L.polyline(alternativeRoute, {
          color: '#a78bfa', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(main);
      } else {
        const alt = L.polyline(alternativeRoute, {
          color: 'rgba(167, 139, 250, 0.4)', weight: 4, dashArray: '8, 8', lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(alt);
      }
    };

    // Helper: draw Ruta Zenit (amarilla)
    const drawZenit = () => {
      if (!route || route.length < 2) return;
      if (safeSelected) {
        const glow = L.polyline(route, {
          color: '#FFD700', weight: 12, opacity: 0.25, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(glow);
        const main = L.polyline(route, {
          color: '#FFD700', weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(main);
      } else {
        const dashed = L.polyline(route, {
          color: '#FFD700', weight: 3, opacity: 0.5, dashArray: '8, 8', lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(dashed);
      }
    };

    // Draw unselected first (behind), then selected on top
    if (safeSelected) {
      drawStandard();
      drawZenit();
    } else {
      drawZenit();
      drawStandard();
    }

    // Origin marker (yellow circle)
    if (origin) {
      const originIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          background: #FFCC00;
          border-radius: 50%;
          box-shadow: 0 0 16px 4px rgba(255, 204, 0, 0.5);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const marker = L.marker(origin, { icon: originIcon }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Destination marker (yellow with dot)
    if (destination) {
      const destIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          background: #FFCC00;
          border-radius: 50%;
          box-shadow: 0 0 12px 3px rgba(255, 204, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        "><div style="width: 8px; height: 8px; background: #1a1a2e; border-radius: 50%;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker(destination, { icon: destIcon }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Friend routes (purple dashed)
    friendRoutes.forEach(fr => {
      if (fr.coordinates.length > 1) {
        const friendPolyline = L.polyline(fr.coordinates, {
          color: '#a78bfa',
          weight: 4,
          dashArray: '6, 6',
          opacity: 0.7,
        }).addTo(mapRef.current!);
        polylinesRef.current.push(friendPolyline);
      }
    });

    // Friend position markers (purple dot at current position)
    friendRoutes.forEach(fr => {
      const dotIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 10px 3px rgba(167, 139, 250, 0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const dotMarker = L.marker(fr.position, { icon: dotIcon }).addTo(mapRef.current!);
      markersRef.current.push(dotMarker);

      // Name label at the midpoint of the route line
      if (fr.coordinates.length >= 2) {
        const midIdx = Math.floor(fr.coordinates.length / 2);
        const labelPos = fr.coordinates[midIdx];
        const labelIcon = L.divIcon({
          className: 'zenit-marker',
          html: `<span style="
            background: rgba(167,139,250,0.85);
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 10px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transform: translateY(-20px);
            display: block;
          ">${fr.name}</span>`,
          iconSize: [60, 20],
          iconAnchor: [30, 20],
        });
        const labelMarker = L.marker(labelPos, { icon: labelIcon }).addTo(mapRef.current!);
        markersRef.current.push(labelMarker);
      }
    });

    // Additional friend location markers (without labels)
    friendLocations.forEach(loc => {
      // Skip if already covered by a friendRoute
      if (friendRoutes.some(fr => fr.position[0] === loc[0] && fr.position[1] === loc[1])) return;
      const friendIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: #a78bfa;
          border-radius: 50%;
          box-shadow: 0 0 10px 3px rgba(167, 139, 250, 0.5);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker(loc, { icon: friendIcon }).addTo(mapRef.current!);
      markersRef.current.push(marker);
      markersRef.current.push(marker);
    });

    // User navigation arrow
    if (showUserArrow && userPosition) {
      const arrowIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<svg width="40" height="48" viewBox="0 0 40 48" fill="none" style="filter: drop-shadow(0 4px 8px rgba(255, 204, 0, 0.5));">
          <path d="M20 0L40 48L20 36L0 48L20 0Z" fill="#FFCC00"/>
        </svg>`,
        iconSize: [40, 48],
        iconAnchor: [20, 24],
      });
      const marker = L.marker(userPosition, { icon: arrowIcon }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }
  }, [origin, destination, route, alternativeRoute, selectedRoute, friendLocations, friendRoutes, showUserArrow, userPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <style>{`
        .zenit-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ background: 'hsl(240 25% 8%)' }}
      />
    </div>
  );
};
