import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dark map style tiles (CartoDB Dark Matter)
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

interface ZenitMapProps {
  center?: [number, number];
  zoom?: number;
  origin?: [number, number];
  destination?: [number, number];
  route?: [number, number][];
  alternativeRoute?: [number, number][];
  friendLocations?: [number, number][];
  showUserArrow?: boolean;
  userPosition?: [number, number];
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
  showUserArrow = false,
  userPosition,
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

  // Update center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers and routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.remove());
    polylinesRef.current = [];

    // Add alternative route (dashed purple)
    if (alternativeRoute && alternativeRoute.length > 1) {
      const altPolyline = L.polyline(alternativeRoute, {
        color: 'rgba(167, 139, 250, 0.5)',
        weight: 4,
        dashArray: '10, 10',
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

    // Friend markers (purple)
    friendLocations.forEach(loc => {
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
  }, [origin, destination, route, alternativeRoute, friendLocations, showUserArrow, userPosition]);

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
