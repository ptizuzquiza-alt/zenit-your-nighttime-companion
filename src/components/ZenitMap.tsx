import { FC, useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MAP_TILE_FILTER,
  MAP_BACKGROUND,
  MAP_ROUTE_SAFE_COLOR,
  MAP_ROUTE_FAST_COLOR,
  MAP_MARKER_FRIEND_COLOR,
} from '@/config/theme';
import { OriginMarkerIcon } from '@/components/icons/OriginMarkerIcon';
import { destinationMarkerHtml } from '@/components/icons/DestinationMarkerIcon';
import { userNavigationArrowHtml } from '@/components/icons/UserNavigationArrowIcon';

// Dark map style tiles (CartoDB Dark Matter)
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const LABELS_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';

const MAP_CSS = `
  .leaflet-tile-pane { filter: ${MAP_TILE_FILTER}; }
`;

interface FriendRoute {
  name: string;
  coordinates: [number, number][];
  position: [number, number];
  dim?: boolean;
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
  centerOffsetPx?: [number, number];
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
  focusBounds,
  centerOffsetPx,
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

    L.tileLayer(DARK_TILE_URL, { opacity: 1 }).addTo(mapRef.current);
    L.tileLayer(LABELS_TILE_URL, { opacity: 0.7 }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update view: fit to route bounds when fitToRoute is active and routes change
  useEffect(() => {
    if (!mapRef.current || focusBounds) return;

    if (fitToRoute && route && route.length > 1) {
      const bounds = L.latLngBounds(route);
      if (alternativeRoute && alternativeRoute.length > 1) {
        alternativeRoute.forEach(pt => bounds.extend(pt));
      }
      if (origin) bounds.extend(origin);
      if (destination) bounds.extend(destination);
      mapRef.current.fitBounds(bounds, { paddingTopLeft: [40, 60], paddingBottomRight: [40, 450], maxZoom: 15, animate: true });
    } else if (!fitToRoute) {
      mapRef.current.setView(center, zoom, { animate: false });
      if (centerOffsetPx && (centerOffsetPx[0] !== 0 || centerOffsetPx[1] !== 0)) {
        mapRef.current.panBy([centerOffsetPx[0], centerOffsetPx[1]], { animate: false });
      }
    }
  }, [center, zoom, route, alternativeRoute, fitToRoute, origin, destination, focusBounds, centerOffsetPx]);

  // Focus on specific bounds (e.g. friend's route)
  useEffect(() => {
    if (!mapRef.current || !focusBounds || focusBounds.length < 2) return;
    const bounds = L.latLngBounds(focusBounds);
    mapRef.current.fitBounds(bounds, { paddingTopLeft: [40, 60], paddingBottomRight: [40, 350], maxZoom: 16, animate: true });
  }, [focusBounds]);

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
          color: MAP_ROUTE_FAST_COLOR, weight: 12, opacity: 0.25, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(glow);
        const main = L.polyline(alternativeRoute, {
          color: MAP_ROUTE_FAST_COLOR, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(main);
      } else {
        // Show Standard clearly as a solid dashed lila line when Zenit is selected
        const altGlow = L.polyline(alternativeRoute, {
          color: MAP_ROUTE_FAST_COLOR, weight: 8, opacity: 0.15, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(altGlow);
        const alt = L.polyline(alternativeRoute, {
          color: MAP_ROUTE_FAST_COLOR, weight: 3, opacity: 0.85, dashArray: '10, 6', lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(alt);
      }
    };

    // Helper: draw Ruta Zenit (amarilla)
    const drawZenit = () => {
      if (!route || route.length < 2) return;
      if (safeSelected) {
        const glow = L.polyline(route, {
          color: MAP_ROUTE_SAFE_COLOR, weight: 12, opacity: 0.25, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(glow);
        const main = L.polyline(route, {
          color: MAP_ROUTE_SAFE_COLOR, weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
        }).addTo(mapRef.current!);
        polylinesRef.current.push(main);
      } else {
        const dashed = L.polyline(route, {
          color: MAP_ROUTE_SAFE_COLOR, weight: 3, opacity: 0.5, dashArray: '8, 8', lineCap: 'round', lineJoin: 'round',
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

    // Origin marker (animated radar badge)
    if (origin) {
      const originIcon = L.divIcon({
        className: 'zenit-marker',
        html: renderToStaticMarkup(<OriginMarkerIcon />),
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      const marker = L.marker(origin, { icon: originIcon }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Destination marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'zenit-marker',
        html: destinationMarkerHtml,
        iconSize: [32, 33],
        iconAnchor: [16, 33],
      });
      const marker = L.marker(destination, { icon: destIcon }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Friend routes (purple dashed)
    friendRoutes.forEach(fr => {
      if (fr.coordinates.length > 1) {
        const friendPolyline = L.polyline(fr.coordinates, {
          color: '#a78bfa',
          weight: fr.dim ? 3 : 4,
          dashArray: '6, 6',
          opacity: fr.dim ? 0.2 : 0.7,
        }).addTo(mapRef.current!);
        polylinesRef.current.push(friendPolyline);
      }
    });

    // Friend position markers (purple dot at current position)
    friendRoutes.forEach(fr => {
      const combinedIcon = L.divIcon({
        className: 'zenit-marker',
        html: fr.dim
          ? `<div style="
              width: 10px;
              height: 10px;
              background: #a78bfa;
              border-radius: 50%;
              opacity: 0.25;
            "></div>`
          : `<div style="display:flex;flex-direction:column;align-items:center;">
              <span style="
                background: rgba(167,139,250,0.85);
                color: white;
                font-size: 11px;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 10px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                margin-bottom: 4px;
              ">${fr.name}</span>
              <div style="
                width: 14px;
                height: 14px;
                background: #a78bfa;
                border-radius: 50%;
                box-shadow: 0 0 10px 3px rgba(167, 139, 250, 0.5);
              "></div>
            </div>`,
            iconSize: [60, 36],
            iconAnchor: [30, 36],
          });
      const marker = L.marker(fr.position, { icon: combinedIcon }).addTo(mapRef.current!);
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
        html: userNavigationArrowHtml,
        iconSize: [83, 83],
        iconAnchor: [41, 41],
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
        ${MAP_CSS}
      `}</style>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ background: `hsl(${MAP_BACKGROUND})` }}
      />
    </div>
  );
};
