import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { LocationInput } from '@/components/LocationInput';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { RouteInfoModal } from '@/components/RouteInfoModal';
import { DirectionCard } from '@/components/DirectionCard';

import { fetchSafeAndFastRoutes, storeSelectedRoute, RouteResult } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';
import { fetchStreetLamps, scoreLighting, getBoundingBox } from '@/lib/streetlamps';
import { CONTACTS } from '@/config/contacts';

const BANNER_DISMISSED_KEY = 'zenit_banner_dismissed';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [safeRoute, setSafeRoute] = useState<RouteResult | null>(null);
  const [fastRoute, setFastRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [safeLightScore, setSafeLightScore] = useState<number | null>(null);
  const [fastLightScore, setFastLightScore] = useState<number | null>(null);

  // UI state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sharedContacts, setSharedContacts] = useState<string[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
  );

  // Panel expand state: 'collapsed' (route cards), 'expanded' (steps visible)
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Bottom sheet drag state
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (panelExpanded && dy > 0) {
      setDragOffset(dy);
    } else if (!panelExpanded && dy < 0) {
      setDragOffset(dy);
    }
  }, [panelExpanded]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const threshold = 60;
    if (panelExpanded && dragOffset > threshold) {
      setPanelExpanded(false);
    } else if (!panelExpanded && dragOffset < -threshold) {
      setPanelExpanded(true);
    }
    setDragOffset(0);
  }, [panelExpanded, dragOffset]);

  const storedDest = getStoredDestination();
  const destination: [number, number] = storedDest
    ? [storedDest.lat, storedDest.lon]
    : [41.4110, 2.1850];

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

  const formatETA = (s: number) => {
    const now = new Date();
    const eta = new Date(now.getTime() + s * 1000);
    return eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleStartNavigation = () => {
    if (currentRouteData) {
      storeSelectedRoute(currentRouteData);
    }
    sessionStorage.setItem('zenit_selected_route_type', selectedRoute);
    sessionStorage.setItem('zenit_shared_contacts', JSON.stringify(sharedContacts));
    navigate('/navigation');
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

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

  const steps = currentRouteData?.steps ?? [];

  // Fixed bar height for spacing
  const FIXED_BAR_HEIGHT = 140; // px approx

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
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="flex-1" onClick={() => navigate('/search')}>
          <LocationInput
            origin={storedOriginName}
            destination={storedDestName}
          />
        </div>
      </div>

      {/* Expandable steps panel - behind fixed bar */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 overflow-hidden"
        style={{
          maxHeight: panelExpanded ? '75vh' : '55vh',
          paddingBottom: `${FIXED_BAR_HEIGHT}px`,
          transform: panelExpanded
            ? `translateY(${Math.max(dragOffset, 0)}px)`
            : `translateY(${Math.min(dragOffset, 0)}px)`,
          transition: isDragging.current ? 'none' : 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 -10px 40px -10px hsla(240, 25%, 5%, 0.5)',
        }}
      >
        {/* Handle */}
        <div
          className="py-3 cursor-grab flex justify-center"
          onClick={() => setPanelExpanded(prev => !prev)}
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-6 overflow-y-auto" style={{ maxHeight: panelExpanded ? `calc(75vh - ${FIXED_BAR_HEIGHT + 16}px)` : `calc(55vh - ${FIXED_BAR_HEIGHT + 16}px)` }}>
          {/* Route selection cards */}
          {!panelExpanded && (
            <>
              <div className="mb-4 px-3 py-2 rounded-xl bg-secondary/40 border border-border/40 flex items-center justify-between">
                <h3 className="text-foreground font-semibold">Elige tu ruta</h3>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 flex items-center justify-center"
                  aria-label="Mostrar información de la ruta"
                >
                  <Info className="w-4.5 h-4.5 text-foreground" />
                </button>
              </div>

              {!bannerDismissed && selectedRoute === 'safe' && (
                <div className="mb-4 p-4 rounded-2xl bg-secondary/60 border border-border/50 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Ruta Zenit</p>
                    <p className="text-xs text-muted-foreground">
                      Esta ruta prioriza calles bien iluminadas, avenidas anchas y vías transitadas para tu seguridad.
                    </p>
                  </div>
                  <button
                    onClick={handleDismissBanner}
                    className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              {loading ? (
                <p className="text-muted-foreground text-sm">Calculando rutas reales…</p>
              ) : (
                <div className="space-y-3 mb-4">
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

              {/* Expand hint */}
              {!loading && steps.length > 0 && (
                <button
                  onClick={() => setPanelExpanded(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Ver pasos de la ruta</span>
                </button>
              )}
            </>
          )}

          {/* Expanded: route summary + steps */}
          {panelExpanded && currentRouteData && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-foreground font-semibold">
                  {selectedRoute === 'safe' ? 'Ruta Zenit' : 'Ruta Estándar'}
                </h3>
                <button
                  onClick={() => setPanelExpanded(false)}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Cerrar</span>
                </button>
              </div>

              {/* Summary */}
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {formatDistance(currentRouteData.distance)}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDuration(currentRouteData.duration)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Llegada a las {formatETA(currentRouteData.duration)}
              </p>

              {/* Steps list */}
              <div className="space-y-2 pb-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                    <DirectionCard
                      distance={step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`}
                      instruction={step.instruction}
                      direction={step.direction}
                    />
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No se encontraron pasos detallados para esta ruta.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fixed bottom bar - always on top */}
      <div className="fixed bottom-0 left-0 right-0 z-[1001] bg-card/98 backdrop-blur-xl border-t border-border/50 px-6 py-4 pb-6">
        <button
          onClick={() => setShowShareModal(true)}
          className="zenit-btn-secondary mb-3"
        >
          Compartir ruta
        </button>
        <button
          onClick={handleStartNavigation}
          className={loading ? 'zenit-btn-primary opacity-50 cursor-not-allowed' : 'zenit-btn-primary'}
          disabled={loading}
        >
          {loading ? 'Cargando…' : 'Iniciar trayecto'}
        </button>
      </div>

      {/* Modals */}
      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(selected) => {
          setSharedContacts(selected);
          setShowShareModal(false);
        }}
        contacts={CONTACTS}
        initialSelected={sharedContacts}
      />

      <RouteInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

export default MapRoutes;
