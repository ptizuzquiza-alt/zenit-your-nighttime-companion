import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { LocationInput } from '@/components/LocationInput';

import { fetchSafeAndFastRoutes, storeSelectedRoute, RouteResult } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';
import { fetchStreetLamps, scoreLighting, getBoundingBox } from '@/lib/streetlamps';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
  const [fastRoute, setFastRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [safeLightScore, setSafeLightScore] = useState<number | null>(null);
  const [fastLightScore, setFastLightScore] = useState<number | null>(null);

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

  // Fetch real routes when origin changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSafeAndFastRoutes(userLocation, destination).then(async ({ safe, fast }) => {
      if (cancelled) return;
      setSafeRoute(safe);
      setFastRoute(fast);
      setLoading(false);

      const allCoords = [safe?.coordinates, fast?.coordinates].filter((c): c is [number, number][] => !!c);
      if (allCoords.length > 0) {
        const bbox = getBoundingBox(allCoords);
        const lamps = await fetchStreetLamps(bbox.minLat, bbox.minLon, bbox.maxLat, bbox.maxLon);
        if (!cancelled && lamps.length > 0) {
          if (safe?.coordinates) setSafeLightScore(Math.round(scoreLighting(safe.coordinates, lamps) * 100));
          if (fast?.coordinates) setFastLightScore(Math.round(scoreLighting(fast.coordinates, lamps) * 100));
        }
      }
    });

    return () => { cancelled = true; };
  }, [userLocation[0], userLocation[1], destination[0], destination[1]]);

  const currentRouteData = selectedRoute === 'safe' ? (safeRoute || fastRoute) : (fastRoute || safeRoute);

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

  const storedOriginName = getStoredOrigin()?.name ?? 'Tu ubicación';
  const storedDestName = getStoredDestination()?.name ?? '';

  const rawSafe = safeLightScore ?? 95;
  const rawFast = fastLightScore ?? 73;
  const displaySafe = Math.max(rawSafe, rawFast + 1);
  const displayFast = Math.min(rawFast, displaySafe - 1);

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
        fitToRoute
        className="absolute inset-0"
      />

      {/* Search bar overlay */}
      <div className="absolute top-10 left-4 right-4 z-[1000] flex items-start gap-3">
        <button
          onClick={() => navigate('/search')}
          className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center mt-2 flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1" onClick={() => navigate('/search')}>
          <LocationInput
            origin={storedOriginName}
            destination={storedDestName}
          />
        </div>
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
              safetyPercentage={displaySafe}
              tags={[`💡 Iluminación: ${displaySafe}%`, 'Áreas activas', 'Calles amplias']}
              selected={selectedRoute === 'safe'}
              onClick={() => setSelectedRoute('safe')}
            />
            {fastRoute && (
              <RouteCard
                type="fast"
                distance={formatDistance(fastRoute.distance)}
                duration={formatDuration(fastRoute.duration)}
                safetyPercentage={displayFast}
                tags={['Camino más corto', `💡 Iluminación: ${displayFast}%`, 'Calles peatonales']}
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
