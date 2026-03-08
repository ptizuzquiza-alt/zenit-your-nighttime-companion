import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { BackButton } from '@/components/BackButton';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { getStoredRoute } from '@/lib/routing';

const contacts = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Carla' },
  { id: '4', name: 'Javier' },
];

const MapRouteDetails: FC = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);

  const storedRoute = getStoredRoute();
  const routeCoords = storedRoute?.coordinates ?? [
    [41.4036, 2.1744],
    [41.4110, 2.1850],
  ];

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
  const destination: [number, number] = routeCoords[routeCoords.length - 1] as [number, number];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={[
          (origin[0] + destination[0]) / 2,
          (origin[1] + destination[1]) / 2,
        ]}
        zoom={14}
        origin={origin}
        destination={destination}
        route={routeCoords as [number, number][]}
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/routes')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-6">
          {sessionStorage.getItem('zenit_selected_route_type') === 'fast'
            ? 'Has elegido la ruta rápida'
            : 'Has elegido la ruta segura'}
        </h3>
        
        <button 
          onClick={() => setShowShareModal(true)}
          className="zenit-btn-secondary mb-3"
        >
          Compartir tu ruta
        </button>
        
        <button 
          onClick={() => navigate('/navigation')}
          className="zenit-btn-primary"
        >
          Iniciar el trayecto
        </button>
      </div>

      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(selected) => {
          setShowShareModal(false);
          navigate('/navigation');
        }}
        contacts={contacts}
      />
    </div>
  );
};

export default MapRouteDetails;
