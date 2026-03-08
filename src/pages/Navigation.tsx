import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';
import { getStoredRoute } from '@/lib/routing';



const JUAN_ORIGIN: [number, number] = [41.4055, 2.1770];
const JUAN_DEST: [number, number] = [41.4100, 2.1850];
const JUAN_FALLBACK: [number, number][] = [
  JUAN_ORIGIN,
  [41.4060, 2.1775],
  [41.4068, 2.1790],
  [41.4075, 2.1805],
  [41.4082, 2.1820],
  [41.4090, 2.1835],
  JUAN_DEST,
];

const Navigation: FC = () => {
  const navigate = useNavigate();
  const [showFriendActivity, setShowFriendActivity] = useState(true);

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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={userPosition}
        zoom={17}
        destination={destination}
        route={routeCoords.slice(routeIndex)}
        friendRoutes={friendRoutes}
        friendLocations={juanRoute.length > 0 ? [juanPosition] : []}
        showUserArrow
        userPosition={userPosition}
        className="absolute inset-0"
      />

      {/* Direction card */}
      <div className="absolute top-12 left-4 right-4 z-[1000]">
        <DirectionCard
          distance="Siga 900 m y"
          instruction="gire a la derecha"
          direction="right"
        />
      </div>

      {/* Map toggle FAB */}
      <div className="absolute bottom-48 right-4 z-[1000]">
        <NavigationFab mode="map" />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-4">Actividades de tus amigos</h3>
        
        {showFriendActivity && (
          <FriendActivityCard
            name="Juan"
            activity="ha completado el 50% de su ruta."
            destination="L'Auditori"
            address="Carrer de Lepant, 150, Eixample"
            time="Hace 2 min"
          />
        )}
        
        <button 
          onClick={() => navigate('/navigation-end')}
          className="zenit-btn-primary mt-4"
        >
          Finalizar trayecto
        </button>
      </div>
    </div>
  );
};

export default Navigation;
