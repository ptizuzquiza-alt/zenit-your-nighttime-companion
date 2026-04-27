import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';
import { fetchZenitRoute, storeSelectedRoute, RouteResult } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

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

    fetchZenitRoute(userLocation, destination).then((zenitRoute) => {
      if (cancelled) return;
      setRoute(zenitRoute);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [userLocation[0], userLocation[1], destination[0], destination[1]]);

  const currentRouteData = route;

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
    sessionStorage.setItem('zenit_selected_route_type', 'safe');
    navigate('/route-details');
  };

  // Compute map center from route bounds
  const mapCenter: [number, number] = route?.coordinates?.length
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
        route={route?.coordinates}
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
        
        <h3 className="text-foreground font-semibold mb-4">Ruta Zenit</h3>
        
        {loading ? (
          <p className="text-muted-foreground text-sm">Calculando ruta segura…</p>
        ) : (
          <div className="space-y-3">
            <RouteCard
              type="safe"
              distance={route ? formatDistance(route.distance) : '—'}
              duration={route ? formatDuration(route.duration) : '—'}
              safetyPercentage={95}
              tags={['Calles bien iluminadas', 'Áreas activas', 'Calles amplias']}
              selected
            />
          </div>
        )}
        
        <button 
          onClick={handleContinue}
          className={loading || !route ? 'zenit-btn-primary mt-4 opacity-50 bg-muted text-muted-foreground cursor-not-allowed' : 'zenit-btn-primary mt-4'}
          disabled={loading || !route}
        >
          {loading ? 'Cargando…' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default MapRoutes;
