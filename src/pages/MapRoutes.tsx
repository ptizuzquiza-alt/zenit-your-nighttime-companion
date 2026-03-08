import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';

// Sample route coordinates (Barcelona area)
const safeRoute: [number, number][] = [
  [41.4036, 2.1744],
  [41.4050, 2.1750],
  [41.4060, 2.1780],
  [41.4080, 2.1790],
  [41.4095, 2.1820],
  [41.4110, 2.1850],
];

const fastRoute: [number, number][] = [
  [41.4036, 2.1744],
  [41.4045, 2.1760],
  [41.4065, 2.1800],
  [41.4090, 2.1830],
  [41.4110, 2.1850],
];

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        }
      );
    }
  }, []);

  const origin = userLocation;
  const destination: [number, number] = [41.4110, 2.1850];
  const currentRoute = selectedRoute === 'safe' ? safeRoute : fastRoute;
  const alternativeRoute = selectedRoute === 'safe' ? fastRoute : safeRoute;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={[41.4070, 2.1790]}
        zoom={15}
        origin={origin}
        destination={destination}
        route={currentRoute}
        alternativeRoute={alternativeRoute}
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/search')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-4">Elige tu ruta</h3>
        
        <div className="space-y-3">
          <RouteCard
            type="safe"
            distance="2.5 km"
            duration="31 min"
            safetyPercentage={95}
            tags={['Calles bien iluminadas', 'Áreas activas']}
            selected={selectedRoute === 'safe'}
            onClick={() => setSelectedRoute('safe')}
          />
          <RouteCard
            type="fast"
            distance="2.3 km"
            duration="25 min"
            safetyPercentage={73}
            tags={['Menor distancia', 'Menos peatones']}
            selected={selectedRoute === 'fast'}
            onClick={() => setSelectedRoute('fast')}
          />
        </div>
        
        <button 
          onClick={() => navigate('/route-details')}
          className="zenit-btn-primary mt-4"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default MapRoutes;
