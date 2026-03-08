import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';
import { getStoredRoute } from '@/lib/routing';

const friendRoutes = [
  {
    name: 'Juan',
    coordinates: [
      [41.4055, 2.1770],
      [41.4060, 2.1760],
      [41.4068, 2.1755],
      [41.4075, 2.1765],
      [41.4080, 2.1780],
      [41.4085, 2.1800],
    ] as [number, number][],
    position: [41.4055, 2.1770] as [number, number],
  },
];

const friendLocations: [number, number][] = [
  [41.4055, 2.1770],
  [41.4075, 2.1800],
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

  // Simulate navigation movement along the real route
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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={userPosition}
        zoom={17}
        destination={destination}
        route={routeCoords.slice(routeIndex)}
        friendLocations={friendLocations}
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
