import { FC, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocateFixed, Share2, Eye, X, Users, AlertTriangle } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';
import { FriendsFab } from '../components/FriendsFab';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { RouteTimeline } from '@/components/RouteTimeline';
import { getStoredRoute } from '@/lib/routing';
import { AVATAR_BY_NAME, getStoredFriends, CONTACTS } from '@/config/contacts';



function getBearing(a: [number, number], b: [number, number]): number {
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function getDirection(coords: [number, number][], idx: number): { dir: 'left' | 'right' | 'straight'; distToTurnM: number } {
  // Walk ahead to find the next real turn and the distance to it
  let distToTurnM = 0;
  for (let i = idx; i + 2 < coords.length; i++) {
    distToTurnM += haversineM(coords[i], coords[i + 1]);
    const b1 = getBearing(coords[i], coords[i + 1]);
    const b2 = getBearing(coords[i + 1], coords[i + 2]);
    let diff = b2 - b1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) > 20) {
      return { dir: diff > 0 ? 'right' : 'left', distToTurnM };
    }
  }
  // No turn ahead — show remaining distance
  const remaining = coords.slice(idx);
  const distM = remaining.length > 1
    ? remaining.reduce((s, pt, i) => i === 0 ? s : s + haversineM(remaining[i - 1], pt), 0)
    : 0;
  return { dir: 'straight', distToTurnM: distM };
}

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

const MARTA_ORIGIN: [number, number] = [41.3890, 2.1590];
const MARTA_DEST: [number, number] = [41.3980, 2.1780];
const MARTA_FALLBACK: [number, number][] = [
  MARTA_ORIGIN,
  [41.3910, 2.1630],
  [41.3940, 2.1700],
  [41.3960, 2.1740],
  MARTA_DEST,
];

const FRIEND_SUMMARIES: Record<string, { activity: string; destination: string; address: string }> = {
  Juan: {
    activity: 'ha completado el 50% de su ruta.',
    destination: "L'Auditori",
    address: 'Carrer de Lepant, 150, Eixample',
  },
  Marta: {
    activity: 'está caminando hacia su destino.',
    destination: 'Trabajo',
    address: 'Gràcia',
  },
};

const Navigation: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const acceptedFriends: string[] = (() => {
    try { return JSON.parse(sessionStorage.getItem('zenit_accepted_friends') || '[]'); } catch { return []; }
  })();
  const [showFriendActivity, setShowFriendActivity] = useState(acceptedFriends.length > 0);
  const [fitAll, setFitAll] = useState(false);
  const [focusedFriend, setFocusedFriend] = useState<string | null>(null);
  const [followUser, setFollowUser] = useState(true);
  const [showFriendsPopup, setShowFriendsPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(() => !!(location.state as { showProblemModal?: boolean })?.showProblemModal);
  const [problemAlerted, setProblemAlerted] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [sharedContacts, setSharedContacts] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_shared_contacts') || '[]');
    } catch { return []; }
  });
  const [sheetState, setSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('middle');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const storedRoute = useMemo(() => getStoredRoute(), []);
  const contacts = getStoredFriends();

  const routeCoords = useMemo<[number, number][]>(() => {
    return (storedRoute?.coordinates as [number, number][]) ?? [
      [41.4036, 2.1744],
      [41.4050, 2.1750],
      [41.4060, 2.1780],
      [41.4080, 2.1790],
      [41.4095, 2.1820],
      [41.4110, 2.1850],
    ];
  }, [storedRoute]);
  const routeSteps = storedRoute?.steps ?? [];

  const [routeIndex, setRouteIndex] = useState(0);
  const [userPosition, setUserPosition] = useState<[number, number]>(routeCoords[0]);
  const [displayBearing, setDisplayBearing] = useState(() =>
    routeCoords.length > 1 ? getBearing(routeCoords[0], routeCoords[1]) : 0
  );

  // Juan's real route + smooth lerp position
  const [juanRoute, setJuanRoute] = useState<[number, number][]>(JUAN_FALLBACK);
  const [juanPosition, setJuanPosition] = useState<[number, number]>(
    JUAN_FALLBACK[Math.floor(JUAN_FALLBACK.length * 0.4)] ?? JUAN_ORIGIN
  );
  const juanAnimRef = useRef<number | null>(null);

  // Fetch Juan's real street route from OSRM
  useEffect(() => {
    const coords = `${JUAN_ORIGIN[1]},${JUAN_ORIGIN[0]};${JUAN_DEST[1]},${JUAN_DEST[0]}`;
    fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data?.code === 'Ok' && data.routes?.length) {
          const pts: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          setJuanRoute(pts);
        } else {
          setJuanRoute([JUAN_ORIGIN, JUAN_DEST]);
        }
      })
      .catch(() => setJuanRoute([JUAN_ORIGIN, JUAN_DEST]));
  }, []);

  // Smooth LERP animation for Juan along his route (walking speed ~1.4 m/s)
  useEffect(() => {
    if (juanRoute.length < 2) return;
    if (juanAnimRef.current !== null) cancelAnimationFrame(juanAnimRef.current);

    const SPEED_MPS = 1.4;
    const startIdx = Math.min(Math.floor(juanRoute.length * 0.4), juanRoute.length - 2);

    let segIdx = startIdx;
    let elapsed = 0;
    let lastTime = performance.now();
    let lastStateUpdate = 0;

    function segDurMs(i: number) {
      const d = haversineM(juanRoute[i], juanRoute[i + 1]);
      return Math.max((d / SPEED_MPS) * 1000, 50);
    }
    let curDur = segDurMs(segIdx);

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 100);
      lastTime = now;
      elapsed += dt;

      while (elapsed >= curDur && segIdx < juanRoute.length - 2) {
        elapsed -= curDur;
        segIdx += 1;
        curDur = segDurMs(segIdx);
      }
      if (segIdx >= juanRoute.length - 2 && elapsed >= curDur) {
        setJuanPosition(juanRoute[juanRoute.length - 1]);
        juanAnimRef.current = null;
        return;
      }

      // Throttle React state updates to ~15 fps to avoid excessive marker recreation
      if (now - lastStateUpdate >= 66) {
        const tc = Math.min(elapsed / curDur, 1);
        const A = juanRoute[segIdx];
        const B = juanRoute[segIdx + 1];
        setJuanPosition([
          A[0] + (B[0] - A[0]) * tc,
          A[1] + (B[1] - A[1]) * tc,
        ]);
        lastStateUpdate = now;
      }

      juanAnimRef.current = requestAnimationFrame(tick);
    };

    juanAnimRef.current = requestAnimationFrame(tick);
    return () => {
      if (juanAnimRef.current !== null) {
        cancelAnimationFrame(juanAnimRef.current);
        juanAnimRef.current = null;
      }
    };
  }, [juanRoute]);

  // Fast-forward: smooth LERP through full route in ≤5 s with damped heading-up
  const handleFastForward = useCallback(() => {
    if (animRef.current !== null) return; // already animating

    const TOTAL_MS = 5000;
    const DEAD_ZONE_DEG = 3;
    const DAMPING = 0.12;

    const totalDistM = routeCoords.reduce(
      (sum, pt, i) => i === 0 ? sum : sum + haversineM(routeCoords[i - 1], pt), 0
    );
    // Per-segment duration proportional to segment length so speed is constant
    const segDurations = routeCoords.slice(0, -1).map((_, i) => {
      const d = haversineM(routeCoords[i], routeCoords[i + 1]);
      return totalDistM > 0 ? (d / totalDistM) * TOTAL_MS : TOTAL_MS / (routeCoords.length - 1);
    });

    let segIdx = 0;
    let elapsed = 0;
    let lastTime = performance.now();
    let smoothBearing = getBearing(routeCoords[0], routeCoords[1]);

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      elapsed += dt;

      // Advance through completed segments
      while (segIdx < segDurations.length - 1 && elapsed >= segDurations[segIdx]) {
        elapsed -= segDurations[segIdx];
        segIdx += 1;
      }

      // Arrived at destination
      if (segIdx >= segDurations.length - 1 && elapsed >= segDurations[segIdx]) {
        setUserPosition(routeCoords[routeCoords.length - 1]);
        setRouteIndex(routeCoords.length - 1);
        animRef.current = null;
        setTimeout(() => navigate('/navigation-end'), 300);
        return;
      }

      const tc = Math.min(elapsed / segDurations[segIdx], 1);
      const A = routeCoords[segIdx];
      const B = routeCoords[segIdx + 1];
      const pos: [number, number] = [
        A[0] + (B[0] - A[0]) * tc,
        A[1] + (B[1] - A[1]) * tc,
      ];

      // Smooth bearing with dead-zone
      const target = getBearing(A, B);
      let diff = target - smoothBearing;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      if (Math.abs(diff) > DEAD_ZONE_DEG) {
        smoothBearing = ((smoothBearing + diff * DAMPING) % 360 + 360) % 360;
      }

      setUserPosition(pos);
      setRouteIndex(segIdx);
      setDisplayBearing(smoothBearing);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [routeCoords, navigate]);

  const destination: [number, number] = routeCoords[routeCoords.length - 1];
  const martaPosition: [number, number] = MARTA_FALLBACK[Math.floor(MARTA_FALLBACK.length * 0.6)] ?? MARTA_ORIGIN;
  const remainingDistanceM = useMemo(() => {
    if (routeCoords.length < 2) return 0;
    return routeCoords.slice(routeIndex).reduce((sum, pt, i, arr) => {
      if (i === 0) return sum;
      return sum + haversineM(arr[i - 1], pt);
    }, 0);
  }, [routeCoords, routeIndex]);
  const remainingDistanceLabel = remainingDistanceM > 1000
    ? `${(remainingDistanceM / 1000).toFixed(1)} km`
    : `${Math.round(remainingDistanceM)} m`;
  const remainingTimeMin = Math.max(1, Math.round(remainingDistanceM / 1.4 / 60));
  const remainingTimeLabel = `${remainingTimeMin} min`;
  const arrivalLabel = new Date(Date.now() + remainingTimeMin * 60_000).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const friendRoutes = acceptedFriends
    .map(id => {
      if (id === 'juan') {
        return {
          id: 'juan',
          name: 'Juan',
          avatar: AVATAR_BY_NAME['Juan'],
          coordinates: juanRoute,
          position: juanPosition,
        };
      }
      if (id === 'marta') {
        return {
          id: 'marta',
          name: 'Marta',
          avatar: AVATAR_BY_NAME['Marta'],
          coordinates: MARTA_FALLBACK,
          position: martaPosition,
        };
      }
      return null;
    })
    .filter((route): route is { id: string; name: string; avatar: string; coordinates: [number, number][]; position: [number, number] } => route !== null);

  const focusedFriendRoute = focusedFriend ? friendRoutes.find(fr => fr.id === focusedFriend) : undefined;
  const sheetHeight = sheetState === 'collapsed'
    ? '250px'
    : sheetState === 'middle'
      ? '250px'
      : 'calc(100% - 40px)';

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0]?.clientY ?? null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || dragStartY.current === null) return;
    if (e.cancelable) e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (dragStartY.current === null) return;

    const endY = e.changedTouches[0]?.clientY;
    if (endY === undefined) {
      dragStartY.current = null;
      return;
    }
    const delta = endY - dragStartY.current;
    dragStartY.current = null;

    const DRAG_THRESHOLD = 30;
    if (Math.abs(delta) < DRAG_THRESHOLD) return;

    if (delta < 0) {
      setSheetState((prev) => (prev === 'collapsed' ? 'middle' : 'expanded'));
      return;
    }

    setSheetState((prev) => (prev === 'expanded' ? 'middle' : 'collapsed'));
  };

  const toggleSheet = () => {
    setSheetState((prev) => {
      if (prev === 'expanded') return 'middle';
      if (prev === 'collapsed') return 'middle';
      return 'expanded';
    });
  };

  return (
    <>
      <div className="fixed inset-0">
        <ZenitMap
          center={userPosition}
          zoom={17}
          destination={destination}
          route={routeCoords.slice(routeIndex)}
          alternativeRoute={fitAll ? friendRoutes[0]?.coordinates : undefined}
          friendRoutes={friendRoutes}
          friendLocations={friendRoutes.map(fr => fr.position)}
          showUserArrow
          userPosition={userPosition}
          fitToRoute={fitAll && !focusedFriend}
          focusBounds={focusedFriendRoute?.coordinates}
          mapBearing={(!fitAll && !focusedFriend) ? displayBearing : undefined}
          lockCenter={followUser && !fitAll && !focusedFriend}
          onDragStart={() => { setFollowUser(false); setShowFriendsPopup(false); }}
          className="w-full h-full"
        />
      </div>

      {/* Direction card — dynamic based on route progress */}
      {(() => {
        const { dir, distToTurnM } = getDirection(routeCoords, routeIndex);
        const distLabel = distToTurnM > 1000
          ? `En ${(distToTurnM / 1000).toFixed(1)} km`
          : `En ${Math.round(distToTurnM)} m`;
        const instrLabel = dir === 'right' ? 'gire a la derecha' : dir === 'left' ? 'gire a la izquierda' : 'has llegado';
        return (
          <div className="fixed top-12 left-4 right-4 z-[1000]">
            <DirectionCard
              distance={distLabel}
              instruction={instrLabel}
              direction={dir === 'straight' ? 'straight' : dir}
              onIconClick={handleFastForward}
            />
          </div>
        );
      })()}

      {/* Bottom sheet */}
      {<div
          className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex flex-col bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border/50 p-6 pb-8 z-[9000] ${!isDragging ? 'transition-[height] duration-300 ease-out' : ''}`}
          style={{
            height: sheetHeight,
            boxShadow: '0 -10px 40px -10px hsla(240, 25%, 5%, 0.5)',
            overscrollBehavior: 'contain',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* FABs floating above the sheet */}
          {sheetState !== 'expanded' && (
            <>
              {/* Friends button — left */}
              <div className="absolute -top-20 left-4 flex flex-col items-start gap-2">
                <div className="flex flex-row items-center gap-2">
                  <FriendsFab
                    active={showFriendsPopup}
                    onClick={() => {
                      setShowFriendsPopup(prev => {
                        const next = !prev;
                        if (!next) {
                          setFocusedFriend(null);
                          setFitAll(false);
                        }
                        return next;
                      });
                    }}
                    className="w-14 h-14"
                    iconClassName="w-7 h-7"
                    inactiveClassName="bg-popover backdrop-blur-sm text-foreground"
                  />

                  {showFriendsPopup && friendRoutes.length > 0 && (
                    <div
                      className="flex flex-row gap-3 px-3 py-2 bg-primary/90 backdrop-blur-sm rounded-full shadow-xl overflow-x-auto items-center"
                      style={{ maxWidth: 'calc(100vw - 5rem)', transformOrigin: 'left center', animation: 'pillExpand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
                    >
                      {friendRoutes.map((friend) => {
                        const active = focusedFriend === friend.id;
                        return (
                          <button
                            key={friend.id}
                            onClick={() => {
                              const opening = focusedFriend !== friend.id;
                              setFocusedFriend(opening ? friend.id : null);
                              setFitAll(false);
                              setFollowUser(false);
                            }}
                            className={`w-11 h-11 rounded-full border-2 overflow-hidden flex-shrink-0 transition-all duration-200 ${
                              active ? 'border-white scale-105' : 'border-white/50'
                            }`}
                          >
                            {friend.avatar ? (
                              <img src={friend.avatar} className="w-full h-full object-cover" alt={friend.name} />
                            ) : (
                              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{friend.name[0]}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Center button — Right */}
              <button
                onClick={() => {
                  setFollowUser(true);
                  setFitAll(false);
                  setFocusedFriend(null);
                  setShowFriendsPopup(false);
                  setSheetState('middle');
                }}
                className={`absolute -top-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  !followUser || fitAll || !!focusedFriend
                    ? 'bg-popover text-primary-foreground'
                    : 'bg-popover backdrop-blur-sm text-foreground'
                }`}
              >
                <LocateFixed className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Lower bar's handle */}
          <div
            className="sticky top-0 z-20 flex w-full justify-center bg-card/95 backdrop-blur-xl pt-1 pb-4"
            onClick={toggleSheet}
          >
            <div className="w-10 h-1 bg-muted-foreground/60 rounded-full cursor-pointer" />
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-shrink-0">
              {/* Lower bar contents */}
              <div className="flex flex-col gap-8 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-foreground">Tiempo restante</span>
                    <span className="text-3xl font-semibold text-foreground">{remainingTimeLabel}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setShowShareModal(true);
                        setShowViewers(false);
                      }}
                      className="flex items-center gap-2 px-5 py-4 rounded-full bg-popover hover:text-muted-foreground transition-colors cursor-pointer"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-lg">{sharedContacts.length}</span>
                    </button>
                    <button
                      onClick={() => { setShowCancelConfirm(true); }}
                      className="px-4 py-4 rounded-full bg-destructive/85 flex items-center justify-center text-destructive hover:bg-destructive/65 transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-foreground">Distancia</span>
                      <span className="text-2xl text-foreground">{remainingDistanceLabel}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-foreground">Previsión</span>
                      <span className="text-2xl text-foreground">{arrivalLabel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAlertModal(true); setAlertSent(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold flex-shrink-0"
                    style={{ background: 'hsl(var(--zenit-yellow) / 0.15)', border: '1px solid hsl(var(--zenit-yellow) / 0.35)', color: 'hsl(var(--zenit-yellow))' }}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    SOS
                  </button>
                </div>
              </div>

              {showViewers && (
                <div className="mb-4 p-4 rounded-2xl bg-secondary/40 border border-border/50">
                  <p className="text-sm font-medium text-foreground mb-3">Viendo tu ruta</p>
                  {sharedContacts.length > 0 ? (
                    <div className="space-y-2">
                      {sharedContacts.map(id => {
                        const contact = contacts.find(c => c.id === id);
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
                  ) : (
                    <div className="text-sm text-muted-foreground">Aún no hay nadie visualizando tu ruta.</div>
                  )}
                </div>
              )}
            </div>

            {sheetState === 'expanded' && (
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain mt-2 pb-2">
                <div className="pt-2">
                  <h4 className="text-foreground text-lg font-medium mb-4">Pasos</h4>
                </div>
                <div className="pb-4">
                  <RouteTimeline
                    originLabel="Tu ubicación"
                    destinationLabel="Destino"
                    startTimeLabel={new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    endTimeLabel={arrivalLabel}
                    steps={routeSteps}
                  />
                  {routeSteps.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No se encontraron pasos detallados.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>}

      {/* Share modal */}
      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(ids) => { setSharedContacts(ids); setShowShareModal(false); }}
        initialSelected={sharedContacts}
        contacts={getStoredFriends()}
      />

      {/* Problem modal — shown when coming back from NavigationEnd via "Aún no he llegado" */}
      {showProblemModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-zenit-purple/20 flex items-center justify-center mb-1">
                <AlertTriangle className="w-6 h-6 text-zenit-purple" />
              </div>
              <h3 className="text-lg font-bold text-foreground">¿Ha habido algún problema?</h3>
            </div>
            {problemAlerted ? (
              <div className="flex flex-col items-center gap-4 text-center py-2">
                <p className="text-sm text-muted-foreground">Ubicación enviada a tus contactos.</p>
                <button
                  onClick={() => { setShowProblemModal(false); setProblemAlerted(false); }}
                  className="zenit-btn-secondary flex items-center justify-center w-full"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setProblemAlerted(true)}
                  className="zenit-btn-primary flex items-center justify-center"
                >
                  Avisar a mis contactos
                </button>
                <button
                  onClick={() => setShowProblemModal(false)}
                  className="zenit-btn-secondary flex items-center justify-center"
                >
                  No, estoy bien
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Alert modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {alertSent ? (
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--zenit-yellow)/0.15)] flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-foreground font-semibold text-base">Aviso enviado</h3>
                  <p className="text-muted-foreground text-sm">
                    Tus contactos han sido notificados de que necesitas ayuda.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--zenit-yellow)/0.15)] flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-foreground font-semibold text-base">¿Necesitas ayuda?</h3>
                  <p className="text-muted-foreground text-sm">
                    Se enviará un aviso a tus contactos con tu ubicación actual.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAlertSent(true)}
                    className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
                  >
                    Avisar a contactos
                  </button>
                  <button
                    onClick={() => window.open('tel:112')}
                    className="flex-1 py-3 rounded-2xl bg-[hsl(var(--zenit-yellow))] text-[#1a0a2e] font-semibold text-sm"
                  >
                    Llamar al 112
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="flex flex-col z-[10051] w-full max-w-sm rounded-2xl bg-card border border-border p-6 gap-2 shadow-2xl">
            <h3 className="text-lg text-center font-bold text-foreground">¿Cancelar esta ruta?</h3>
            {sharedContacts.length > 0 && (
              <p className="text-sm text-center mb-3">
                Se le notificará a tus amigos de que tu ruta ha sido cancelada antes de llegar a su destino.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelConfirm(false); }}
                className="flex-1 py-3 rounded-3xl bg-popover text-foreground font-semibold transition-colors hover:bg-secondary/80"
              >
                Volver
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-3xl bg-destructive text-destructive-foreground font-semibold transition-colors"
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
