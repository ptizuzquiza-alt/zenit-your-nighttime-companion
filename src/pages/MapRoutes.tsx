import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';
import ReportDarkStreet from '@/components/ReportDarkStreet';
import { fetchSafeAndFastRoutes, storeSelectedRoute } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';
import { scoreLightingForRoute, fetchDarkStreetsInBounds, type DarkStreet } from '@/lib/lightPoints';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
  const [fastRoute, setFastRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [safeLightScore, setSafeLightScore] = useState<number | null>(null);
  const [fastLightScore, setFastLightScore] = useState<number | null>(null);
  const [darkStreets, setDarkStreets] = useState<DarkStreet[]>([]);

  // Bottom sheet drag state
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    // Only allow dragging down when expanded, or up when collapsed
    if (!sheetCollapsed && dy > 0) {
      setDragOffset(dy);
    } else if (sheetCollapsed && dy < 0) {
      setDragOffset(dy);
    }
  }, [sheetCollapsed]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const threshold = 60;
    if (!sheetCollapsed && dragOffset > threshold) {
      setSheetCollapsed(true);
    } else if (sheetCollapsed && dragOffset < -threshold) {
      setSheetCollapsed(false);
    }
    setDragOffset(0);
  }, [sheetCollapsed, dragOffset]);

  // Get destination from search selection or fallback
  const storedDest = getStoredDestination();
  const destination: [number, number] = storedDest
    ? [storedDest.lat, storedDest.lon]
    : [41.4110, 2.1850];

  // Get custom origin or use geolocation
  const storedOrigin = getStoredOrigin();

  useEffect(() => {
    if (storedOrigin) {
      setUserLocation([storedOrigin.lat, storedOrigin.lon]);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        }
      );
    }
  }, []);

  // Fetch dark streets in the route area
  const loadDarkStreets = useCallback(() => {
    const minLat = Math.min(userLocation[0], destination[0]) - 0.01;
    const maxLat = Math.max(userLocation[0], destination[0]) + 0.01;
    const minLng = Math.min(userLocation[1], destination[1]) - 0.01;
    const maxLng = Math.max(userLocation[1], destination[1]) + 0.01;
    fetchDarkStreetsInBounds(minLat, maxLat, minLng, maxLng).then(setDarkStreets);
  }, [userLocation[0], userLocation[1], destination[0], destination[1]]);

  // Fetch real routes when origin changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadDarkStreets();

    fetchSafeAndFastRoutes(userLocation, destination).then(async ({ safe, fast }) => {
      if (cancelled) return;
      setSafeRoute(safe);
      setFastRoute(fast);
      setLoading(false);

      // Score lighting using the light points database (not rendered on map)
      if (safe?.coordinates) {
        scoreLightingForRoute(safe.coordinates).then(s => !cancelled && setSafeLightScore(s.score));
      }
      if (fast?.coordinates) {
        scoreLightingForRoute(fast.coordinates).then(s => !cancelled && setFastLightScore(s.score));
      }
    });

    return () => { cancelled = true; };
  }, [userLocation[0], userLocation[1], destination[0], destination[1]]);

  const currentRouteData = selectedRoute === 'safe' ? (safeRoute || fastRoute) : (fastRoute || safeRoute);
  const alternativeRouteData = selectedRoute === 'safe' ? (fastRoute || safeRoute) : (safeRoute || fastRoute);

  const formatDistance = (m: number) => `${(m / 1000).toFixed(1)} km`;
  const formatDuration = (s: number) => {
    const mins = Math.round(s / 60);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h} h ${m} min` : `${h} h`;
    }
    return `${mins} min`;
  };

  const handleContinue = () => {
    if (currentRouteData) {
      storeSelectedRoute(currentRouteData);
    }
    sessionStorage.setItem('zenit_selected_route_type', selectedRoute);
    navigate('/route-details');
  };

  // Compute map center from route bounds
  const mapCenter: [number, number] = safeRoute?.coordinates?.length
    ? [
        (userLocation[0] + destination[0]) / 2,
        (userLocation[1] + destination[1]) / 2,
      ]
    : [41.4070, 2.1790];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={mapCenter}
        zoom={14}
        origin={userLocation}
        destination={destination}
        route={safeRoute?.coordinates}
        alternativeRoute={fastRoute?.coordinates}
        selectedRoute={selectedRoute}
        darkStreets={darkStreets}
        fitToRoute
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/search')} />
      </div>

      {/* Report dark street button (top right) */}
      <div className="absolute top-12 right-4 z-[1000]">
        <ReportDarkStreet
          latitude={mapCenter[0]}
          longitude={mapCenter[1]}
          onReported={loadDarkStreets}
        />
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="zenit-bottom-sheet p-6 pb-8 z-[1000]"
        style={{
          transform: sheetCollapsed
            ? `translateY(calc(100% - 48px + ${Math.min(dragOffset, 0)}px))`
            : `translateY(${Math.max(dragOffset, 0)}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          className="zenit-sheet-handle mb-4 cursor-grab"
          onClick={() => setSheetCollapsed((c) => !c)}
        />
        
        <h3 className="text-foreground font-semibold mb-4">Elige tu ruta</h3>
        
        {loading ? (
          <p className="text-muted-foreground text-sm">Calculando rutas reales…</p>
        ) : (
          <div className="space-y-3">
            <RouteCard
              type="safe"
              distance={safeRoute ? formatDistance(safeRoute.distance) : '—'}
              duration={safeRoute ? formatDuration(safeRoute.duration) : '—'}
              safetyPercentage={safeLightScore ?? 95}
              tags={[safeLightScore !== null ? `💡 Iluminación: ${safeLightScore}%` : 'Calles bien iluminadas', 'Áreas activas', 'Calles amplias']}
              selected={selectedRoute === 'safe'}
              onClick={() => setSelectedRoute('safe')}
            />
            {fastRoute && (
              <RouteCard
                type="fast"
                distance={formatDistance(fastRoute.distance)}
                duration={formatDuration(fastRoute.duration)}
                safetyPercentage={fastLightScore ?? 73}
                tags={['Calles peatonales', fastLightScore !== null ? `💡 Iluminación: ${fastLightScore}%` : 'Menos iluminada', 'Camino más corto']}
                selected={selectedRoute === 'fast'}
                onClick={() => setSelectedRoute('fast')}
              />
            )}
          </div>
        )}
        
        <button 
          onClick={handleContinue}
          className={loading ? 'zenit-btn-primary mt-4 opacity-50 bg-muted text-muted-foreground cursor-not-allowed' : 'zenit-btn-primary mt-4'}
          disabled={loading}
        >
          {loading ? 'Cargando…' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default MapRoutes;
