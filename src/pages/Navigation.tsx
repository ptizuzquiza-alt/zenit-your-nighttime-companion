import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Users, Navigation2, Share2, Eye, X } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { getStoredRoute } from '@/lib/routing';
import { CONTACTS } from '@/config/contacts';



const JUAN_ORIGIN: [number, number] = [41.3950, 2.1650];
const JUAN_DEST: [number, number] = [41.4080, 2.1820];
const JUAN_FALLBACK: [number, number][] = [
  JUAN_ORIGIN,
  [41.3970, 2.1680],
  [41.4000, 2.1720],
  [41.4030, 2.1760],
  [41.4060, 2.1800],
  JUAN_DEST,
];

const Navigation: FC = () => {
  const navigate = useNavigate();
  const [showFriendActivity, setShowFriendActivity] = useState(true);
  const [fitAll, setFitAll] = useState(false);
  const [focusJuan, setFocusJuan] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [sharedContacts, setSharedContacts] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_shared_contacts') || '[]');
    } catch { return []; }
  });
  const [sheetOffset, setSheetOffset] = useState(0);
  const sheetCollapsedByUser = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const storedRoute = getStoredRoute();
  const routeCoords: [number, number][] = (storedRoute?.coordinates as [number, number][]) ?? [
    [41.4036, 2.1744],
    [41.4050, 2.1750],
    [41.4060, 2.1780],
    [41.4080, 2.1790],
    [41.4095, 2.1820],
    [41.4110, 2.1850],
  ];

  const [routeIndex, setRouteIndex] = useState(0);
  const [userPosition, setUserPosition] = useState<[number, number]>(routeCoords[0]);

  // Juan's real route + animated position
  const [juanRoute, setJuanRoute] = useState<[number, number][]>(JUAN_FALLBACK);
  const [juanIndex, setJuanIndex] = useState(Math.floor(JUAN_FALLBACK.length * 0.4));
  const juanPosition = juanRoute[juanIndex] ?? JUAN_ORIGIN;

  // Fetch Juan's real street route from OSRM
  useEffect(() => {
    const coords = `${JUAN_ORIGIN[1]},${JUAN_ORIGIN[0]};${JUAN_DEST[1]},${JUAN_DEST[0]}`;
    fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        console.log('OSRM Juan response:', data?.code);
        if (data?.code === 'Ok' && data.routes?.length) {
          const pts: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          setJuanRoute(pts);
          setJuanIndex(Math.floor(pts.length * 0.4));
        } else {
          // Fallback route
          setJuanRoute([JUAN_ORIGIN, JUAN_DEST]);
          setJuanIndex(0);
        }
      })
      .catch(() => {
        console.log('OSRM Juan fetch failed, using fallback');
        setJuanRoute([JUAN_ORIGIN, JUAN_DEST]);
        setJuanIndex(0);
      });
  }, []);

  // Simulate Juan moving
  useEffect(() => {
    if (juanRoute.length < 2) return;
    const interval = setInterval(() => {
      setJuanIndex(prev => (prev + 1 < juanRoute.length ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [juanRoute]);

  // Simulate user movement along the real route
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex((prev) => {
        const next = prev + 1;
        if (next < routeCoords.length) {
          setUserPosition(routeCoords[next]);
          return next;
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [routeCoords]);

  const destination: [number, number] = routeCoords[routeCoords.length - 1];

  const friendRoutes = [{
    name: 'Juan',
    coordinates: juanRoute,
    position: juanPosition,
  }];
  // Get the full height of the sheet content (minus handle area)
  const getSheetContentHeight = () => {
    if (!sheetRef.current) return 300;
    return sheetRef.current.offsetHeight - 40; // keep handle visible
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setSheetOffset(delta); // only allow dragging down
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = getSheetContentHeight() * 0.3;
    if (sheetOffset > threshold) {
      setSheetOffset(getSheetContentHeight());
      sheetCollapsedByUser.current = true;
    } else {
      setSheetOffset(0);
      sheetCollapsedByUser.current = false;
    }
  };

  const toggleSheet = () => {
    if (sheetOffset > 0) {
      setSheetOffset(0);
    } else {
      setSheetOffset(getSheetContentHeight());
    }
  };

  return (
    <>
      <div className="fixed inset-0">
        <ZenitMap
          center={userPosition}
          zoom={17}
          destination={destination}
          route={routeCoords.slice(routeIndex)}
          alternativeRoute={fitAll ? juanRoute : undefined}
          friendRoutes={friendRoutes}
          friendLocations={juanRoute.length > 0 ? [juanPosition] : []}
          showUserArrow
          userPosition={userPosition}
          fitToRoute={fitAll && !focusJuan}
          focusBounds={focusJuan ? juanRoute : undefined}
          className="w-full h-full"
        />
      </div>

      {/* Direction card */}
      <div className="fixed top-12 left-4 right-4 z-[1000]">
        <DirectionCard
          distance="Siga 900 m y"
          instruction="gire a la derecha"
          direction="right"
        />
      </div>

      {/* Bottom sheet - portal to escape overflow-hidden ancestor */}
      {createPortal(
        <div 
          ref={sheetRef}
          className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 p-6 pb-8 z-[9999] ${!isDragging ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{ 
            boxShadow: '0 -10px 40px -10px hsla(240, 25%, 5%, 0.5)',
            transform: `translateY(${sheetOffset}px)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
      {/* FAB floating above the sheet */}
          <button
            onClick={() => {
              if (fitAll || focusJuan) {
                // Re-center on user
                setFitAll(false);
                setFocusJuan(false);
                setSheetOffset(0);
              } else {
                setFitAll(prev => !prev);
              }
            }}
            className={`absolute -top-16 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              fitAll || focusJuan
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card/80 backdrop-blur-sm text-foreground'
            }`}
          >
            {fitAll || focusJuan ? (
              <Navigation2 className="w-5 h-5" />
            ) : (
              <Users className="w-5 h-5" />
            )}
          </button>

          <div 
            className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4 cursor-pointer" 
            onClick={toggleSheet}
          />
          
          {/* Header with title + action buttons */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-semibold">
              Actividades de tus amigos
            </h3>
            <div className="flex items-center gap-2">
              {/* Viewers count */}
              <button
                onClick={() => sharedContacts.length > 0 && setShowViewers(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 transition-colors ${
                  sharedContacts.length > 0 ? 'text-muted-foreground hover:text-foreground cursor-pointer' : 'text-muted-foreground/50 cursor-default'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">{sharedContacts.length}</span>
              </button>
              {/* Share button */}
              <button
                onClick={() => {
                  setShowShareModal(true);
                  setShowViewers(false);
                  const h = sheetRef.current ? sheetRef.current.offsetHeight - 40 : 300;
                  setSheetOffset(h);
                }}
                className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewers list */}
          {showViewers && sharedContacts.length > 0 && (
            <div className="mb-4 p-4 rounded-2xl bg-secondary/40 border border-border/50">
              <p className="text-sm font-medium text-foreground mb-3">Viendo tu ruta</p>
              <div className="space-y-2">
                {sharedContacts.map(id => {
                  const contact = CONTACTS.find(c => c.id === id);
                  if (!contact) return null;

                  if (confirmRemoveId === id) {
                    return (
                      <div key={id} className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                        <p className="text-sm text-foreground mb-3">
                          ¿Dejar de compartir tu ruta con <strong>{contact.name}</strong>?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSharedContacts(prev => prev.filter(x => x !== id));
                              setConfirmRemoveId(null);
                            }}
                            className="flex-1 text-sm py-2 rounded-xl bg-destructive text-destructive-foreground font-medium"
                          >
                            Sí, dejar de compartir
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="flex-1 text-sm py-2 rounded-xl bg-secondary text-foreground font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">{contact.name[0]}</span>
                      </div>
                      <span className="text-sm text-foreground flex-1">{contact.name}</span>
                      <button
                        onClick={() => setConfirmRemoveId(id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {showFriendActivity && (
            <FriendActivityCard
              onClick={() => {
                setFocusJuan(prev => !prev);
                setFitAll(false);
                if (!focusJuan) {
                  const h = sheetRef.current ? sheetRef.current.offsetHeight - 40 : 300;
                  setSheetOffset(h);
                }
              }}
              name="Juan"
              activity="ha completado el 50% de su ruta."
              destination="L'Auditori"
              address="Carrer de Lepant, 150, Eixample"
              time="Hace 2 min"
            />
          )}
          
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => { setShowCancelConfirm(true); setSheetOffset(getSheetContentHeight()); }}
              className="flex-1 py-3 rounded-2xl bg-secondary text-foreground font-semibold text-center transition-colors hover:bg-secondary/80"
            >
              Cancelar
            </button>
            <button 
              onClick={() => navigate('/navigation-end')}
              className="flex-1 zenit-btn-primary"
            >
              Finalizar
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Share modal */}
      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(ids) => { setSharedContacts(ids); setShowShareModal(false); setSheetOffset(0); }}
        initialSelected={sharedContacts}
        contacts={CONTACTS}
      />

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">¿Cancelar esta ruta?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Se le notificará a tus amigos de que tu ruta ha sido cancelada antes de llegar a su destino.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelConfirm(false); setSheetOffset(0); }}
                className="flex-1 py-3 rounded-2xl bg-secondary text-foreground font-semibold transition-colors hover:bg-secondary/80"
              >
                Volver
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-2xl bg-destructive text-destructive-foreground font-semibold transition-colors"
              >
                Cancelar ruta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
