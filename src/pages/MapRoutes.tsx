import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchSafeAndFastRoutes, storeSelectedRoute, storeSelectedMode, RouteResult, TransportMode } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';
import { scoreLightingForRoute, fetchLightPointsNearRoute, LightPoint } from '@/lib/lightPoints';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [transportMode, setTransportMode] = useState<TransportMode>('foot');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
  const [fastRoute, setFastRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [safeLightScore, setSafeLightScore] = useState<number | null>(null);
  const [fastLightScore, setFastLightScore] = useState<number | null>(null);
  const [lightPoints, setLightPoints] = useState<LightPoint[]>([]);

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

  // Fetch real routes when origin changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSafeAndFastRoutes(userLocation, destination, transportMode).then(({ safe, fast }) => {
      if (cancelled) return;
      setSafeRoute(safe);
      setFastRoute(fast);
      setLoading(false);

      // Score lighting for both routes
      if (safe?.coordinates) {
        scoreLightingForRoute(safe.coordinates).then(s => !cancelled && setSafeLightScore(s.score));
        fetchLightPointsNearRoute(safe.coordinates).then(lp => !cancelled && setLightPoints(lp));
      }
      if (fast?.coordinates) {
        scoreLightingForRoute(fast.coordinates).then(s => !cancelled && setFastLightScore(s.score));
      }
    });

    return () => { cancelled = true; };
  }, [userLocation[0], userLocation[1], destination[0], destination[1], transportMode]);

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
    storeSelectedMode(transportMode);
    navigate('/route-details');
  };

  const getSafeTags = (mode: TransportMode): string[] => {
    switch (mode) {
      case 'foot':  return ['Calles bien iluminadas', 'Áreas activas', 'Calles amplias'];
      case 'car':   return ['Avenidas principales', 'Menos giros', 'Rutas directas'];
      case 'metro': return ['Metro preferido', 'Paradas cercanas', 'Menos caminata'];
      case 'bus':   return ['Bus preferido', 'Paradas cercanas', 'Menos caminata'];
    }
  };

  const getFastTags = (mode: TransportMode): string[] => {
    switch (mode) {
      case 'foot':  return ['Ruta más corta', 'Camino directo', 'Menor tiempo'];
      case 'car':   return ['Ruta más rápida', 'Conducción directa', 'Menor tiempo'];
      case 'metro':
      case 'bus': {
        const base = ['Tránsito más rápido', 'Menor duración'];
        if (fastRoute?.walkDistance) base.push(`${Math.round(fastRoute.walkDistance)}m a pie`);
        return base;
      }
    }
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
        lightPoints={lightPoints}
        showLightPoints={selectedRoute === 'safe'}
        fitToRoute
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/search')} />
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
        
        <h3 className="text-foreground font-semibold mb-3">Elige tu ruta</h3>

        <ToggleGroup
          type="single"
          value={transportMode}
          onValueChange={(v) => { if (v) { setTransportMode(v as TransportMode); setSelectedRoute('safe'); } }}
          className="w-full mb-4 bg-secondary/40 rounded-xl p-1 gap-0"
        >
          <ToggleGroupItem value="foot" className="flex-1 text-xs rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9">
            🚶 A pie
          </ToggleGroupItem>
          <ToggleGroupItem value="metro" className="flex-1 text-xs rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9">
            🚇 Metro
          </ToggleGroupItem>
          <ToggleGroupItem value="bus" className="flex-1 text-xs rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9">
            🚌 Bus
          </ToggleGroupItem>
          <ToggleGroupItem value="car" className="flex-1 text-xs rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm h-9">
            🚗 Coche
          </ToggleGroupItem>
        </ToggleGroup>

        {loading ? (
          <p className="text-muted-foreground text-sm">Calculando rutas reales…</p>
        ) : (
          <div className="space-y-3">
            <RouteCard
              type="safe"
              distance={safeRoute ? formatDistance(safeRoute.distance) : '—'}
              duration={safeRoute ? formatDuration(safeRoute.duration) : '—'}
              safetyPercentage={safeRoute?.safetyScore ?? 92}
              primaryMode={transportMode}
              tags={getSafeTags(transportMode)}
              safetyPercentage={safeLightScore ?? 95}
              tags={[safeLightScore !== null ? `💡 Iluminación: ${safeLightScore}%` : 'Calles bien iluminadas', 'Áreas activas', 'Calles amplias']}
              selected={selectedRoute === 'safe'}
              onClick={() => setSelectedRoute('safe')}
              isTransit={safeRoute?.isTransit}
              transitLegs={safeRoute?.transitLegs}
              transfers={safeRoute?.transfers}
              walkDistance={safeRoute?.walkDistance ? formatDistance(safeRoute.walkDistance) : undefined}
            />
            {fastRoute && (
              <RouteCard
                type="fast"
                distance={formatDistance(fastRoute.distance)}
                duration={formatDuration(fastRoute.duration)}
                safetyPercentage={fastRoute.safetyScore ?? 73}
                primaryMode={transportMode}
                tags={getFastTags(transportMode)}
                selected={selectedRoute === 'fast'}
                onClick={() => setSelectedRoute('fast')}
                isTransit={fastRoute.isTransit}
                transitLegs={fastRoute.transitLegs}
                transfers={fastRoute.transfers}
                walkDistance={fastRoute.walkDistance ? formatDistance(fastRoute.walkDistance) : undefined}
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
