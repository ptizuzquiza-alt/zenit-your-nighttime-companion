import { FC, useState, useEffect, useRef, type PointerEvent, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, X } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { LocationInput } from '@/components/LocationInput';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { RouteInfoModal } from '@/components/RouteInfoModal';
import { RouteTimeline } from '@/components/RouteTimeline';
import { ShieldCheckIcon } from '@/components/icons/ShieldCheckIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import { ArrowDiagonalIcon } from '@/components/icons/ArrowDiagonalIcon';

import { fetchZenitRoute, storeSelectedRoute, RouteResult } from '@/lib/routing';
import { getStoredDestination, getStoredOrigin } from '@/lib/geocoding';
import { CONTACTS } from '@/config/contacts';
import { MAP_ROUTE_SAFE_COLOR } from '@/config/theme';

const BANNER_DISMISSED_KEY = 'zenit_banner_dismissed';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [sharedContacts, setSharedContacts] = useState<string[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
  );

  // Panel state: 'minimized' | 'half-expanded' | 'fully-expanded'
  const [panelState, setPanelState] = useState<'minimized' | 'half-expanded' | 'fully-expanded'>('minimized');
  const dragStartYRef = useRef<number | null>(null);

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
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverscrollY = html.style.overscrollBehaviorY;
    const previousBodyOverscrollY = body.style.overscrollBehaviorY;

    // Prevent pull-to-refresh and scroll chaining to the page while this view is active.
    html.style.overscrollBehaviorY = 'none';
    body.style.overscrollBehaviorY = 'none';

    return () => {
      html.style.overscrollBehaviorY = previousHtmlOverscrollY;
      body.style.overscrollBehaviorY = previousBodyOverscrollY;
    };
  }, []);

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

  const formatETA = (s: number) => {
    const now = new Date();
    const eta = new Date(now.getTime() + s * 1000);
    return eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatNow = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const handleStartNavigation = () => {
    if (currentRouteData) {
      storeSelectedRoute(currentRouteData);
    }
    sessionStorage.setItem('zenit_selected_route_type', 'safe');
    sessionStorage.setItem('zenit_shared_contacts', JSON.stringify(sharedContacts));
    navigate('/navigation');
  };

  const draggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const justCollapsedFromFullRef = useRef(false);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  const handleHandlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    draggingRef.current = false;
    justCollapsedFromFullRef.current = false;
    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHandlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null || activePointerIdRef.current !== e.pointerId) return;
    const deltaY = dragStartYRef.current - e.clientY;
    if (Math.abs(deltaY) > 10) {
      draggingRef.current = true;
    }
  };

  const handleHandlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null || activePointerIdRef.current !== e.pointerId) return;
    const deltaY = dragStartYRef.current - e.clientY;
    dragStartYRef.current = null;
    activePointerIdRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (Math.abs(deltaY) >= 30) {
      handlePanelDrag(deltaY);
    }
  };

  const handleHandlePointerCancel = (e: PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    dragStartYRef.current = null;
    activePointerIdRef.current = null;
  };

  const handleHandleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    dragStartYRef.current = e.touches[0]?.clientY ?? null;
    draggingRef.current = false;
    justCollapsedFromFullRef.current = false;
  };

  const handleHandleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const currentY = e.touches[0]?.clientY;
    if (currentY === undefined) return;
    const deltaY = dragStartYRef.current - currentY;
    if (Math.abs(deltaY) > 10) {
      draggingRef.current = true;
    }
  };

  const handleHandleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const endY = e.changedTouches[0]?.clientY;
    if (endY === undefined) {
      dragStartYRef.current = null;
      return;
    }

    const deltaY = dragStartYRef.current - endY;
    dragStartYRef.current = null;

    if (Math.abs(deltaY) >= 30) {
      handlePanelDrag(deltaY);
    }
  };

  const handleHandleTouchCancel = (e: TouchEvent<HTMLDivElement>) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    dragStartYRef.current = null;
  };

  const handleHandleClick = () => {
    if (draggingRef.current) {
      draggingRef.current = false;
      return;
    }

    setPanelState((prev) => {
      if (prev === 'fully-expanded') {
        justCollapsedFromFullRef.current = true;
        return 'half-expanded';
      }

      if (prev === 'half-expanded') {
        if (justCollapsedFromFullRef.current) {
          justCollapsedFromFullRef.current = false;
          return 'half-expanded';
        }
        return 'minimized';
      }

      justCollapsedFromFullRef.current = false;
      return 'half-expanded';
    });
  };

  const handlePanelDrag = (deltaY: number) => {
    const DRAG_THRESHOLD = 30; // pixels

    if (Math.abs(deltaY) < DRAG_THRESHOLD) {
      return;
    }

    if (deltaY > 0) {
      // Drag UP
      if (panelState === 'minimized') {
        setPanelState('half-expanded');
      } else if (panelState === 'half-expanded') {
        setPanelState('fully-expanded');
      }
    } else {
      // Drag DOWN
      if (panelState === 'fully-expanded') {
        setPanelState('half-expanded');
      } else if (panelState === 'half-expanded') {
        setPanelState('minimized');
      }
    }
  };

  const mapCenter: [number, number] = route?.coordinates?.length
    ? [
        (userLocation[0] + destination[0]) / 2,
        (userLocation[1] + destination[1]) / 2,
      ]
    : [41.4070, 2.1790];

  const storedOriginName = getStoredOrigin()?.name ?? 'Tu ubicación';
  const storedDestName = getStoredDestination()?.name ?? '';

  const steps = currentRouteData?.steps ?? [];

  // Calculate panel height based on state
  const getPanelHeight = () => {
    if (panelState === 'minimized') return bannerDismissed ? '240px' : '340px';
    if (panelState === 'half-expanded') return 'calc(15vh + 240px)';
    return 'calc(100vh - 40px)'; // fully-expanded, leaving 50px at top for search bar interaction
  };

  const panelHeight = getPanelHeight();
  const panelZIndex = 'z-[1000]';
  const FIXED_BAR_HEIGHT = 140; // px approx

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
        className={`fixed bottom-0 left-0 right-0 ${panelZIndex} bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 overflow-hidden flex flex-col`}
        style={{
          height: panelHeight,
          transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 -10px 40px -10px hsla(240, 25%, 5%, 0.5)',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Handle */}
        <div
          className="py-3 cursor-pointer flex justify-center select-none"
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerCancel}
          onTouchStart={handleHandleTouchStart}
          onTouchMove={handleHandleTouchMove}
          onTouchEnd={handleHandleTouchEnd}
          onTouchCancel={handleHandleTouchCancel}
          onClick={handleHandleClick}
          style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
          aria-label={
            panelState === 'minimized'
              ? 'Expandir panel de ruta'
              : panelState === 'half-expanded'
                ? 'Expandir panel completamente o minimizar'
                : 'Minimizar panel de ruta'
          }
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div
          className="px-6 pb-4 flex items-center justify-between cursor-pointer"
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerCancel}
          onTouchStart={handleHandleTouchStart}
          onTouchMove={handleHandleTouchMove}
          onTouchEnd={handleHandleTouchEnd}
          onTouchCancel={handleHandleTouchCancel}
          onClick={handleHandleClick}
          style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          <div className="flex items-center justify-between shrink-0 gap-6">
            <div
              className="inline-flex items-center gap-3 rounded-full border-2 p-0 pr-6"
              style={{ borderColor: MAP_ROUTE_SAFE_COLOR, color: MAP_ROUTE_SAFE_COLOR }}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: MAP_ROUTE_SAFE_COLOR }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-950">
                  <path d="M6 14.6459V4.95C6 4.70147 6.20147 4.5 6.45 4.5H17.55C17.7985 4.5 18 4.70147 18 4.95V14.6459C18 15.7822 17.358 16.821 16.3416 17.3292L12.2012 19.3994C12.0746 19.4627 11.9254 19.4627 11.7988 19.3994L7.65836 17.3292C6.64201 16.821 6 15.7822 6 14.6459Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.375 10.875L11.625 13.125L15.375 9.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="font-semibold">Ruta Zenit</h3>
            </div>
            {panelState === 'minimized' && currentRouteData && (
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span>{formatDuration(currentRouteData.duration)}</span>
                <span>·</span>
                <span>{formatDistance(currentRouteData.distance)}</span>
              </div>
            )}
          </div>

          <div className="ml-3 flex-shrink-0 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoModal(true);
              }}
              className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 flex items-center justify-center"
              aria-label="Mostrar información de la ruta"
            >
              <Info className="w-4.5 h-4.5 text-foreground" />
            </button>
          </div>
        </div>

        {!bannerDismissed && (
          <div
            className="px-6 pb-4 shrink-0 cursor-pointer"
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            onPointerCancel={handleHandlePointerCancel}
            onTouchStart={handleHandleTouchStart}
            onTouchMove={handleHandleTouchMove}
            onTouchEnd={handleHandleTouchEnd}
            onTouchCancel={handleHandleTouchCancel}
            onClick={handleHandleClick}
            style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
          >
            <div className="p-4 rounded-xl bg-[#665D93] border border-border/50 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#332D54' }}>
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-white">
                    La <b className="text-accent">Ruta Zenit</b> prioriza las vias más bien iluminadas, más anchas y con mayor flujo de personas.
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissBanner();
                }}
                className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        )}

        {(panelState === 'half-expanded' || panelState === 'fully-expanded') && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6" style={{ paddingBottom: `${FIXED_BAR_HEIGHT}px`, WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <p className="text-muted-foreground text-sm">Calculando ruta segura…</p>
            ) : currentRouteData ? (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {formatDuration(currentRouteData.duration)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDistance(currentRouteData.distance)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Llegada a las {formatETA(currentRouteData.duration)}
                </p>

                <h4 className="text-foreground text-lg font-medium mb-4">Pasos</h4>

                <div className="pb-4">
                  <RouteTimeline
                    originLabel={storedOriginName}
                    destinationLabel={storedDestName || 'Destino'}
                    startTimeLabel={formatNow()}
                    endTimeLabel={formatETA(currentRouteData.duration)}
                    steps={steps}
                  />
                  {steps.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No se encontraron pasos detallados para esta ruta.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Esperando ruta segura…</p>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom bar - always on top */}
      <div className="fixed bottom-0 left-0 right-0 z-[1001] bg-card/98 backdrop-blur-xl border-t border-border/50 px-6 py-4 pb-6">
        <button
          onClick={() => setShowShareModal(true)}
          className="zenit-btn-secondary mb-3 inline-flex items-center justify-center"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Compartir ruta
        </button>
        <button
          onClick={handleStartNavigation}
          className={loading || !route ? 'zenit-btn-primary inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed' : 'zenit-btn-primary inline-flex items-center justify-center gap-2'}
          disabled={loading || !route}
          style={{ background: '#FFEE02', color: '#333000' }}
        >
          <ArrowDiagonalIcon className="w-5 h-5" />
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
