import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { SearchBar } from '@/components/SearchBar';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { FriendRequestModal } from '@/components/FriendRequestModal';
import { PendingRequestsList } from '@/components/PendingRequestsList';

const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const FRIEND_ROUTES = [
  {
    id: 'juan',
    name: 'Juan',
    origin: [41.3950, 2.1650] as [number, number],
    dest: [41.4080, 2.1820] as [number, number],
    fallback: [
      [41.3950, 2.1650], [41.3970, 2.1680], [41.4000, 2.1720],
      [41.4030, 2.1760], [41.4060, 2.1800], [41.4080, 2.1820],
    ] as [number, number][],
    activity: 'está caminando',
    destination: 'Casa',
    address: 'Eixample',
    minutesAgo: 5,
    totalDurationMin: 20,
    progress: 0.4,
  },
  {
    id: 'marta',
    name: 'Marta',
    origin: [41.3890, 2.1590] as [number, number],
    dest: [41.3980, 2.1780] as [number, number],
    fallback: [
      [41.3890, 2.1590], [41.3910, 2.1630], [41.3940, 2.1700],
      [41.3960, 2.1740], [41.3980, 2.1780],
    ] as [number, number][],
    activity: 'está caminando',
    destination: 'Trabajo',
    address: 'Gràcia',
    minutesAgo: 2,
    totalDurationMin: 15,
    progress: 0.6,
  },
];

const MapIdle: FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [friendData, setFriendData] = useState<
    { name: string; coordinates: [number, number][]; position: [number, number]; durationSec?: number }[]
  >([]);
  const [showFriends, setShowFriends] = useState(false);
  const [focusBounds, setFocusBounds] = useState<[number, number][] | undefined>(undefined);

  // Friend request system
  const [notificationQueue, setNotificationQueue] = useState<{ id: string; name: string }[]>([]);
  const [currentRequest, setCurrentRequest] = useState<{ id: string; name: string } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<{ id: string; name: string }[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_pending_requests') || '[]');
    } catch { return []; }
  });
  const [acceptedFriends, setAcceptedFriends] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_accepted_friends') || '[]');
    } catch { return []; }
  });
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show next request from queue with delay
  const showNextFromQueue = useCallback((queue: { id: string; name: string }[]) => {
    if (queue.length === 0) {
      setCurrentRequest(null);
      return;
    }
    queueTimerRef.current = setTimeout(() => {
      setCurrentRequest(queue[0]);
      setNotificationQueue(queue.slice(1));
    }, 2500);
  }, []);

  // Simulate incoming friend requests after a delay
  useEffect(() => {
    const alreadyHandled = [...acceptedFriends, ...pendingRequests.map(r => r.id)];
    const incoming = FRIEND_ROUTES
      .filter(fr => !alreadyHandled.includes(fr.id))
      .map(fr => ({ id: fr.id, name: fr.name }));

    if (incoming.length > 0) {
      const timer = setTimeout(() => {
        setCurrentRequest(incoming[0]);
        setNotificationQueue(incoming.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cleanup timer
  useEffect(() => {
    return () => { if (queueTimerRef.current) clearTimeout(queueTimerRef.current); };
  }, []);

  const handleAcceptRequest = useCallback((id: string) => {
    setAcceptedFriends(prev => {
      const next = [...prev, id];
      sessionStorage.setItem('zenit_accepted_friends', JSON.stringify(next));
      return next;
    });
    // Remove from pending if it was there
    setPendingRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      sessionStorage.setItem('zenit_pending_requests', JSON.stringify(next));
      return next;
    });
    setCurrentRequest(null);
    showNextFromQueue(notificationQueue);
  }, [notificationQueue, showNextFromQueue]);

  const handleRejectRequest = useCallback((id: string) => {
    const request = currentRequest || pendingRequests.find(r => r.id === id);
    if (request) {
      // Move to pending (dismissed) state
      setPendingRequests(prev => {
        if (prev.some(r => r.id === id)) return prev;
        const next = [...prev, { id: request.id, name: request.name }];
        sessionStorage.setItem('zenit_pending_requests', JSON.stringify(next));
        return next;
      });
    }
    setCurrentRequest(null);
    showNextFromQueue(notificationQueue);
  }, [currentRequest, notificationQueue, pendingRequests, showNextFromQueue]);

  const handlePendingReject = useCallback((id: string) => {
    setPendingRequests(prev => {
      const next = prev.filter(r => r.id !== id);
      sessionStorage.setItem('zenit_pending_requests', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch friend routes from OSRM
  useEffect(() => {
    Promise.all(
      FRIEND_ROUTES.map(async (fr) => {
        try {
          const coords = `${fr.origin[1]},${fr.origin[0]};${fr.dest[1]},${fr.dest[0]}`;
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data?.code === 'Ok' && data.routes?.length) {
            const pts: [number, number][] = data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );
            const idx = Math.floor(pts.length * fr.progress);
            return { name: fr.name, coordinates: pts, position: pts[idx], durationSec: data.routes[0].duration };
          }
        } catch { /* fallback */ }
        const idx = Math.floor(fr.fallback.length * fr.progress);
        return { name: fr.name, coordinates: fr.fallback, position: fr.fallback[idx], durationSec: fr.totalDurationMin * 60 };
      })
    ).then(setFriendData);
  }, []);

  // Only show accepted friends
  const acceptedFriendRoutes = friendData
    .filter(fd => acceptedFriends.includes(FRIEND_ROUTES.find(fr => fr.name === fd.name)?.id ?? ''))
    .map(({ name, coordinates, position }) => ({ name, coordinates, position }));

  const badgeCount = acceptedFriends.length + pendingRequests.length;

  // Compute real departure/arrival times
  const friendTimes = useMemo(() => {
    const now = new Date();
    return FRIEND_ROUTES.map((fr) => {
      const match = friendData.find((d) => d.name === fr.name);
      const departureDate = new Date(now.getTime() - fr.minutesAgo * 60_000);
      const totalSec = match?.durationSec ?? fr.totalDurationMin * 60;
      const arrivalDate = new Date(departureDate.getTime() + totalSec * 1000);
      return {
        name: fr.name,
        time: `Hace ${fr.minutesAgo} min`,
        departureTime: formatTime(departureDate),
        estimatedArrival: formatTime(arrivalDate),
      };
    });
  }, [friendData]);

  // Only show accepted friends in cards
  const acceptedFriendData = FRIEND_ROUTES.filter(fr => acceptedFriends.includes(fr.id));

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={userLocation}
        zoom={15}
        origin={userLocation}
        friendRoutes={showFriends ? acceptedFriendRoutes : []}
        focusBounds={focusBounds}
        className="absolute inset-0"
      />

      {/* Search bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 z-[1000]">
        <SearchBar
          placeholder="Buscar"
          onClick={() => navigate('/search')}
          readOnly
        />
      </div>

      {/* Friends FAB with badge */}
      <div className="absolute bottom-6 left-4 z-[1000]">
        <button
          onClick={() => setShowFriends((p) => !p)}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            showFriends
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/90 text-muted-foreground border border-border'
          }`}
        >
          <Users className="w-5 h-5" />
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
              {badgeCount}
            </span>
          )}
        </button>
      </div>

      {/* Locate me FAB */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <button
          onClick={() => {
            setFocusBounds(undefined);
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
              });
            }
          }}
          className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center shadow-lg"
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>

      {/* Friends activity cards */}
      {showFriends && (acceptedFriendRoutes.length > 0 || pendingRequests.length > 0) && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000] space-y-2 max-h-[60vh] overflow-y-auto pb-2">
          {/* Pending requests */}
          <PendingRequestsList
            requests={pendingRequests}
            onAccept={handleAcceptRequest}
            onReject={handlePendingReject}
          />

          {/* Active friends */}
          {acceptedFriendRoutes.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Amigos activos
              </p>
              {acceptedFriendData.map((fr) => {
                const match = acceptedFriendRoutes.find((r) => r.name === fr.name);
                const times = friendTimes.find((t) => t.name === fr.name);
                return (
                  <FriendActivityCard
                    key={fr.name}
                    name={fr.name}
                    activity={fr.activity}
                    destination={fr.destination}
                    address={fr.address}
                    time={times?.time ?? `Hace ${fr.minutesAgo} min`}
                    departureTime={times?.departureTime}
                    estimatedArrival={times?.estimatedArrival}
                    onClick={() => {
                      if (match) {
                        setFocusBounds(match.coordinates);
                      }
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Friend request modal */}
      <FriendRequestModal
        request={currentRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
};

export default MapIdle;
