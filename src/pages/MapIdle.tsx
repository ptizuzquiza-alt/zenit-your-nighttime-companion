import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, Map, User, UserPlus, Users, X } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { SearchBar } from '@/components/SearchBar';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { FriendsFab } from '../components/FriendsFab';
import { LuciTutorial } from '@/components/LuciTutorial';
import { AVATAR_BY_NAME, SHARING_ROUTE_IDS } from '@/config/contacts';
import { isTutorialSeen, markTutorialSeen, type TutorialId } from '@/lib/tutorials';
import { useAuth } from '@/contexts/AuthContext';

const formatTime = (date: Date) =>
  date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

type MapIdleTutorialId = Extract<TutorialId, 'mapSearch' | 'mapFriends'>;

const MAP_SEARCH_TUTORIAL = (
  <>
    Haz tu <strong className="text-accent">primera ruta</strong> usando la
    barra de búsqueda.
  </>
);

const MAP_FRIENDS_TUTORIAL = (
  <>
    Mira las <strong className="text-accent">rutas de tus amigos</strong> cuando te las compartan.
  </>
);

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
    { name: string; coordinates: [number, number][]; position: [number, number]; durationSec?: number; routeOrigin?: [number, number]; routeDest?: [number, number] }[]
  >([]);
  const { profile } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const isDemo = localStorage.getItem('zenit_friends') === null;
  const currentUserName = localStorage.getItem('zenit_name') || (isDemo ? 'Patricia' : '');

  // Filter simulated routes to only friends the current user actually has.
  // If zenit_friends key is absent the account is Patricia's demo → show all.
  const [myFriendRoutes] = useState<typeof FRIEND_ROUTES>(() => {
    const stored = localStorage.getItem('zenit_friends');
    if (stored === null) {
      if (!localStorage.getItem('zenit_name')) localStorage.setItem('zenit_name', 'Patricia');
      if (!localStorage.getItem('zenit_saved_places')) {
        localStorage.setItem('zenit_saved_places', JSON.stringify([
          { id: 'demo-casa', label: 'Casa', name: 'Carrer de Provença 321, Barcelona', address: 'Eixample, Barcelona', lat: 41.3963, lon: 2.1607, icon: 'home' },
          { id: 'demo-trabajo', label: 'Trabajo', name: 'Passeig de Gràcia 92, Barcelona', address: 'Eixample, Barcelona', lat: 41.3952, lon: 2.1617, icon: 'work' },
        ]));
      }
      return FRIEND_ROUTES;
    }
    try {
      const ids = (JSON.parse(stored) as { id: string }[]).map(f => f.id);
      return FRIEND_ROUTES.filter(fr => ids.includes(fr.id));
    } catch { return FRIEND_ROUTES; }
  });
  const [showFriends, setShowFriends] = useState(false);
  const [focusBounds, setFocusBounds] = useState<[number, number][] | undefined>(undefined);
  const [activeTutorial, setActiveTutorial] = useState<MapIdleTutorialId | null>(null);

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
  const [flyToPoint, setFlyToPoint] = useState<[number, number] | undefined>(undefined);

  const dismissTutorial = useCallback((tutorialId: MapIdleTutorialId) => {
    markTutorialSeen(tutorialId);
    setActiveTutorial((current) => {
      if (current !== tutorialId) return current;
      return null;
    });
  }, []);

  // Auto-accept all friends when they share their location
  useEffect(() => {
    const incoming = myFriendRoutes.filter(fr => !acceptedFriends.includes(fr.id));
    if (incoming.length > 0) {
      const timer = setTimeout(() => {
        setAcceptedFriends(prev => {
          const next = [...new Set([...prev, ...incoming.map(fr => fr.id)])];
          sessionStorage.setItem('zenit_accepted_friends', JSON.stringify(next));
          return next;
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) {
      setProfilePhoto(profile.avatar_url);
    } else {
      const stored = localStorage.getItem('zenit_photo');
      if (stored) setProfilePhoto(stored);
    }
  }, [profile]);

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
      myFriendRoutes.map(async (fr) => {
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
            return { name: fr.name, coordinates: pts, position: pts[idx], durationSec: data.routes[0].duration, routeOrigin: fr.origin, routeDest: fr.dest };
          }
        } catch { /* fallback */ }
        const idx = Math.floor(fr.fallback.length * fr.progress);
        return { name: fr.name, coordinates: fr.fallback, position: fr.fallback[idx], durationSec: fr.totalDurationMin * 60, routeOrigin: fr.origin, routeDest: fr.dest };
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

  const handleNavBarClick = useCallback((path?: string) => {
    dismissTutorial('mapSearch');
    if (path) navigate(path);
  }, [dismissTutorial, navigate]);

  // Only show routes for friends being actively tracked
  const acceptedFriendRoutes = friendData
    .filter(fd => {
      const fr = FRIEND_ROUTES.find(r => r.name === fd.name);
      return fr && acceptedFriends.includes(fr.id);
    })
    .map(({ name, coordinates, position, routeOrigin, routeDest }) => {
      const fr = FRIEND_ROUTES.find(r => r.name === name);
      return {
        name,
        avatar: AVATAR_BY_NAME[name],
        coordinates,
        position,
        dim: fr ? hiddenFriends.includes(fr.id) : false,
        routeOrigin,
        routeDest,
      };
    });

  const badgeCount = myFriendRoutes.filter(fr => SHARING_ROUTE_IDS.has(fr.id)).length;

  useEffect(() => {
    if (activeTutorial !== null) return;

    if (!isTutorialSeen('mapSearch')) {
      setActiveTutorial('mapSearch');
      return;
    }

    if (!isTutorialSeen('mapFriends')) {
      setActiveTutorial('mapFriends');
    }
  }, [activeTutorial]);

  // Compute real departure/arrival times
  const friendTimes = useMemo(() => {
    const now = new Date();
    return myFriendRoutes.map((fr) => {
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
  const acceptedFriendData = myFriendRoutes.filter(fr => acceptedFriends.includes(fr.id));

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
        flyToPoint={flyToPoint}
        className="absolute inset-0"
      />

      {/* Search bar + profile icon */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-12 pb-4 z-[1000] flex items-center gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar ruta"
            onClick={() => {
              dismissTutorial('mapSearch');
              navigate('/search');
            }}
            readOnly
          />
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-14 h-14 rounded-full backdrop-blur-sm border border-border flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          {profilePhoto || AVATAR_BY_NAME[currentUserName] ? (
            <img
              src={profilePhoto || AVATAR_BY_NAME[currentUserName] || ''}
              alt={currentUserName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Tutorial overlay */}
      {activeTutorial === 'mapSearch' && (
        <div className="absolute top-32 left-4 right-4 z-[1000]">
          <LuciTutorial
            message={MAP_SEARCH_TUTORIAL}
            onClose={() => dismissTutorial('mapSearch')}
            showPortrait
          />
        </div>
      )}

      {activeTutorial === 'mapFriends' && (
        <div className="absolute bottom-40 left-4 right-4 z-[1000]">
          <LuciTutorial
            message={MAP_FRIENDS_TUTORIAL}
            onClose={() => dismissTutorial('mapFriends')}
            showPortrait
          />
        </div>
      )}

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

        {/* Horizontal row: Friends Button + Friends' profiles */}
        <div className="flex flex-row items-center gap-2">
          {/* Main button */}
          <FriendsFab
            active={showFriends}
            badgeCount={badgeCount}
            onClick={() => { setShowFriends((p) => !p); setActiveFriendLabel(null); }}
            className="w-14 h-14 flex-shrink-0"
          />

          {/* Avatar pill expanding to the right */}
          {showFriends && (
            <div
              className="flex flex-row gap-3 px-3 py-2 bg-secondary backdrop-blur-sm rounded-full shadow-xl overflow-x-auto items-center"
              style={{ maxWidth: 'calc(100vw - 5rem)', transformOrigin: 'left center', animation: 'pillExpand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
            >
              {badgeCount === 0 && (
                <span className="text-xs text-muted-foreground px-1 whitespace-nowrap">Aún no tienes ningún amigo en ruta</span>
              )}
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
                      if (opening && match) {
                        setFlyToPoint([...match.position] as [number, number]);
                        setFocusBounds(undefined);
                      } else {
                        setFlyToPoint(undefined);
                        const allCoords = acceptedFriendRoutes.flatMap(r => r.coordinates);
                        if (allCoords.length >= 2) setFocusBounds(allCoords);
                      }
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

      {/* Center button */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <button
          onClick={() => {
            setFocusBounds(undefined);
            setActiveFriendLabel(null);
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                setUserLocation(loc);
                setFlyToPoint([...loc]);
              });
            } else {
              setFlyToPoint([...userLocation]);
            }
          }}
          className="w-14 h-14 rounded-full bg-popover flex items-center justify-center shadow-lg"
        >
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <LocateFixed className="w-6 h-6" />
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

      {/* Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-card backdrop-blur-md border-t border-border flex items-center justify-around px-8 z-[1000]">
        <button className="flex flex-col items-center justify-center gap-0.5 w-12">
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-medium">Mapa</span>
        </button>
        <button
          onClick={() => navigate('/friends')}
          className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground w-12"
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Amigos</span>
        </button>
      </div>
    </div>
  );
};

export default MapIdle;
