import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';

const route: [number, number][] = [
  [41.4036, 2.1744],
  [41.4050, 2.1750],
  [41.4060, 2.1780],
  [41.4080, 2.1790],
  [41.4095, 2.1820],
  [41.4110, 2.1850],
];

const friendLocations: [number, number][] = [
  [41.4055, 2.1770],
  [41.4075, 2.1800],
];

const Navigation: FC = () => {
  const navigate = useNavigate();
  const [showFriendActivity, setShowFriendActivity] = useState(true);
  const [userPosition, setUserPosition] = useState<[number, number]>([41.4050, 2.1755]);
  const [routeIndex, setRouteIndex] = useState(1);

  // Simulate navigation movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteIndex((prev) => {
        if (prev < route.length - 1) {
          setUserPosition(route[prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const destination: [number, number] = [41.4110, 2.1850];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={userPosition}
        zoom={17}
        destination={destination}
        route={route.slice(routeIndex)}
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
