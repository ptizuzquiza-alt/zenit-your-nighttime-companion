import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Map, User, UserPlus, X } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { SearchBar } from '@/components/SearchBar';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { FriendRequestModal } from '@/components/FriendRequestModal';
import { PendingRequestsList } from '@/components/PendingRequestsList';
import { AVATAR_BY_NAME } from '@/config/contacts';

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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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
  const [hiddenFriends, setHiddenFriends] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_hidden_friends') || '[]');
    } catch { return []; }
  });
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendInput, setAddFriendInput] = useState('');
  const [activeFriendLabel, setActiveFriendLabel] = useState<string | null>(null);
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
    const stored = localStorage.getItem('zenit_photo');
    if (stored) {
      setProfilePhoto(stored);
    }
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
  const toggleFriendVisibility = useCallback((id: string) => {
    setHiddenFriends(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      sessionStorage.setItem('zenit_hidden_friends', JSON.stringify(next));
      return next;
    });
  }, []);

  // Only show routes for friends being actively tracked
  const acceptedFriendRoutes = friendData
    .filter(fd => {
      const fr = FRIEND_ROUTES.find(r => r.name === fd.name);
      return fr && acceptedFriends.includes(fr.id);
    })
    .map(({ name, coordinates, position }) => {
      const fr = FRIEND_ROUTES.find(r => r.name === name);
      return { name, avatar: AVATAR_BY_NAME[name], coordinates, position, dim: fr ? hiddenFriends.includes(fr.id) : false };
    });

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
        friendRoutes={showFriends
          ? (activeFriendLabel
              ? acceptedFriendRoutes.filter(r => r.name === activeFriendLabel)
              : acceptedFriendRoutes)
          : []}
        focusBounds={focusBounds}
        className="absolute inset-0"
      />

      {/* Search bar + profile icon */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-12 pb-4 z-[1000] flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar"
            onClick={() => navigate('/search')}
            readOnly
          />
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          {profilePhoto || AVATAR_BY_NAME['Patricia'] ? (
            <img
              src={profilePhoto || AVATAR_BY_NAME['Patricia'] || ''}
              alt="Patricia"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Friends speed-dial */}
      <div className="absolute bottom-20 left-4 right-4 z-[1000] flex flex-col items-start gap-2">
        {/* Label card above the row */}
        {showFriends && activeFriendLabel && (() => {
          const fr = acceptedFriendData.find(f => f.name === activeFriendLabel);
          const times = friendTimes.find(t => t.name === activeFriendLabel);
          const match = acceptedFriendRoutes.find(r => r.name === activeFriendLabel);
          if (!fr) return null;
          return (
            <div className="w-full" style={{ animation: 'slideUpFade 0.15s ease both' }}>
              <FriendActivityCard
                name={fr.name}
                avatar={AVATAR_BY_NAME[fr.name]}
                activity={fr.activity}
                destination={fr.destination}
                address={fr.address}
                time={times?.time ?? `Hace ${fr.minutesAgo} min`}
                departureTime={times?.departureTime}
                estimatedArrival={times?.estimatedArrival}
                tracking={!hiddenFriends.includes(fr.id)}
                onToggleTracking={() => toggleFriendVisibility(fr.id)}
                onClick={() => { if (match) setFocusBounds(match.coordinates); }}
              />
            </div>
          );
        })()}

        {/* Pending requests above row */}
        {showFriends && pendingRequests.length > 0 && (
          <PendingRequestsList
            requests={pendingRequests}
            onAccept={handleAcceptRequest}
            onReject={handlePendingReject}
          />
        )}

        {/* Horizontal row: FAB first, then avatar pill */}
        <div className="flex flex-row items-center gap-2">
          {/* Main FAB */}
          <button
            onClick={() => { setShowFriends((p) => !p); setActiveFriendLabel(null); }}
            className={`relative w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg transition-colors ${
              showFriends
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/90 text-muted-foreground border border-border'
            }`}
          >
            <Users className="w-7 h-7" />
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                {badgeCount}
              </span>
            )}
          </button>

          {/* Avatar pill expanding to the right */}
          {showFriends && (
            <div
              className="flex flex-row gap-3 px-3 py-2 bg-primary/90 backdrop-blur-sm rounded-full shadow-xl overflow-x-auto items-center"
              style={{ maxWidth: 'calc(100vw - 5rem)', transformOrigin: 'left center', animation: 'pillExpand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
            >
              {acceptedFriendData.map((fr, i) => {
                const match = acceptedFriendRoutes.find((r) => r.name === fr.name);
                const isActive = activeFriendLabel === fr.name;
                const isDimmed = activeFriendLabel !== null && !isActive;
                return (
                  <button
                    key={fr.name}
                    onClick={() => {
                      const opening = activeFriendLabel !== fr.name;
                      setActiveFriendLabel(opening ? fr.name : null);
                      if (opening && match) setFocusBounds(match.coordinates);
                    }}
                    className={`w-11 h-11 rounded-full border-2 overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'border-white scale-105' : 'border-white/50'
                    }`}
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      animation: `avatarPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${80 + i * 60}ms both`,
                    }}
                  >
                    <img src={AVATAR_BY_NAME[fr.name]} alt={fr.name} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Locate me FAB */}
      <div className="absolute bottom-20 right-4 z-[1000]">
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



      {/* Add friend modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6" onClick={() => setShowAddFriend(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl p-5 w-full max-w-[320px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-foreground font-semibold">Añadir amigo</p>
              <button onClick={() => setShowAddFriend(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nombre de usuario o teléfono"
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-3"
              autoFocus
            />
            <button
              onClick={() => { setAddFriendInput(''); setShowAddFriend(false); }}
              disabled={!addFriendInput.trim()}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Enviar solicitud
            </button>
          </div>
        </div>
      )}

      {/* Friend request modal */}
      <FriendRequestModal
        request={currentRequest}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />

      {/* Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-8 z-[1000]">
        <button className="flex items-center justify-center text-primary w-12 h-12">
          <Map className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate('/friends')}
          className="flex items-center justify-center text-muted-foreground w-12 h-12"
        >
          <Users className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MapIdle;
