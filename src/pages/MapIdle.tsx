import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { SearchBar } from '@/components/SearchBar';
import { FriendActivityCard } from '@/components/FriendActivityCard';

const FRIEND_ROUTES = [
  {
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
    time: 'Hace 5 min',
    progress: 0.4,
  },
  {
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
    time: 'Hace 2 min',
    progress: 0.6,
  },
];

const MapIdle: FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [friendRoutes, setFriendRoutes] = useState<
    { name: string; coordinates: [number, number][]; position: [number, number] }[]
  >([]);
  const [showFriends, setShowFriends] = useState(false);
  const [focusBounds, setFocusBounds] = useState<[number, number][] | undefined>(undefined);

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
            return { name: fr.name, coordinates: pts, position: pts[idx] };
          }
        } catch { /* fallback */ }
        const idx = Math.floor(fr.fallback.length * fr.progress);
        return { name: fr.name, coordinates: fr.fallback, position: fr.fallback[idx] };
      })
    ).then(setFriendRoutes);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={userLocation}
        zoom={15}
        origin={userLocation}
        friendRoutes={showFriends ? friendRoutes : []}
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

      {/* Friends FAB */}
      <div className="absolute bottom-6 left-4 z-[1000]">
        <button
          onClick={() => setShowFriends((p) => !p)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            showFriends
              ? 'bg-primary text-primary-foreground'
              : 'bg-card/90 text-muted-foreground border border-border'
          }`}
        >
          <Users className="w-5 h-5" />
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
      {showFriends && friendRoutes.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 z-[1000] space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Amigos activos
          </p>
          {FRIEND_ROUTES.map((fr) => {
            const match = friendRoutes.find((r) => r.name === fr.name);
            return (
              <FriendActivityCard
                key={fr.name}
                name={fr.name}
                activity={fr.activity}
                destination={fr.destination}
                address={fr.address}
                time={fr.time}
                onClick={() => {
                  if (match) {
                    setFocusBounds(match.coordinates);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapIdle;
