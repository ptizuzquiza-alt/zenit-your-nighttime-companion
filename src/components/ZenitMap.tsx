import { FC, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom yellow origin marker
const originIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #FFCC00;
    border-radius: 50%;
    box-shadow: 0 0 16px 4px rgba(255, 204, 0, 0.5);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom yellow destination marker with inner dot
const destinationIcon = L.divIcon({
  className: 'custom-marker',
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

// Purple friend marker
const friendIcon = L.divIcon({
  className: 'custom-marker',
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

// User navigation arrow
const userArrowIcon = L.divIcon({
  className: 'custom-marker',
  html: `<svg width="40" height="48" viewBox="0 0 40 48" fill="none" style="filter: drop-shadow(0 4px 8px rgba(255, 204, 0, 0.5));">
    <path d="M20 0L40 48L20 36L0 48L20 0Z" fill="#FFCC00"/>
  </svg>`,
  iconSize: [40, 48],
  iconAnchor: [20, 24],
});

// Dark map style tiles (CartoDB Dark Matter)
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

// Component to handle map centering
const MapController: FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

export const ZenitMap: FC<ZenitMapProps> = ({
  center = [41.4036, 2.1744], // Barcelona by default
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
  return (
    <div className={`relative w-full h-full ${className}`}>
      <style>{`
        .leaflet-container {
          background: hsl(240 25% 8%);
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer url={DARK_TILE_URL} attribution={DARK_ATTRIBUTION} />
        
        {/* Alternative route (dashed purple) */}
        {alternativeRoute && alternativeRoute.length > 1 && (
          <Polyline
            positions={alternativeRoute}
            pathOptions={{
              color: 'rgba(167, 139, 250, 0.5)',
              weight: 4,
              dashArray: '10, 10',
            }}
          />
        )}
        
        {/* Main route (solid white) */}
        {route && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: '#ffffff',
              weight: 4,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
        
        {/* Origin marker */}
        {origin && <Marker position={origin} icon={originIcon} />}
        
        {/* Destination marker */}
        {destination && <Marker position={destination} icon={destinationIcon} />}
        
        {/* Friend markers */}
        {friendLocations.map((loc, index) => (
          <Marker key={`friend-${index}`} position={loc} icon={friendIcon} />
        ))}
        
        {/* User navigation arrow */}
        {showUserArrow && userPosition && (
          <Marker position={userPosition} icon={userArrowIcon} />
        )}
      </MapContainer>
    </div>
  );
};
