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
  friendLocations?: [number, number][];
  friendRoutes?: FriendRoute[];
  showUserArrow?: boolean;
  userPosition?: [number, number];
  fitToRoute?: boolean;
  className?: string;
}

export const ZenitMap: FC<ZenitMapProps> = ({
  center = [41.4036, 2.1744],
  zoom = 15,
  origin,
  destination,
  route,
  alternativeRoute,
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

  // Update view: fit to route bounds or set center/zoom
  useEffect(() => {
    if (!mapRef.current) return;
    if (fitToRoute && route && route.length > 1) {
      const bounds = L.latLngBounds(route);
      if (alternativeRoute && alternativeRoute.length > 1) {
        alternativeRoute.forEach(pt => bounds.extend(pt));
      }
      if (origin) bounds.extend(origin);
      if (destination) bounds.extend(destination);
      mapRef.current.fitBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [50, 350], maxZoom: 16, animate: true });
    } else {
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

    // Add alternative route (dashed, semi-transparent)
    if (alternativeRoute && alternativeRoute.length > 1) {
      const altPolyline = L.polyline(alternativeRoute, {
        color: 'rgba(167, 139, 250, 0.6)',
        weight: 5,
        dashArray: '8, 8',
      }).addTo(mapRef.current);
      polylinesRef.current.push(altPolyline);
    }

    // Add main route (solid white)
    if (route && route.length > 1) {
      const mainPolyline = L.polyline(route, {
        color: '#ffffff',
        weight: 4,
      }).addTo(mapRef.current);
      polylinesRef.current.push(mainPolyline);
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

    // Friend markers (purple) with name labels
    friendRoutes.forEach(fr => {
      const friendIcon = L.divIcon({
        className: 'zenit-marker',
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <span style="
            background: rgba(167,139,250,0.85);
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 10px;
            white-space: nowrap;
            margin-bottom: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${fr.name}</span>
          <div style="
            width: 14px;
            height: 14px;
            background: #a78bfa;
            border-radius: 50%;
            box-shadow: 0 0 10px 3px rgba(167, 139, 250, 0.5);
          "></div>
        </div>`,
        iconSize: [60, 40],
        iconAnchor: [30, 40],
      });
      const marker = L.marker(fr.position, { icon: friendIcon }).addTo(mapRef.current!);
      markersRef.current.push(marker);
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
  }, [origin, destination, route, alternativeRoute, friendLocations, friendRoutes, showUserArrow, userPosition]);

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
