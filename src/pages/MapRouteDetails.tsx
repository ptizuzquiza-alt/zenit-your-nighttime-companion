import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { BackButton } from '@/components/BackButton';
import { ShareRouteModal } from '@/components/ShareRouteModal';

const contacts = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Carla' },
  { id: '4', name: 'Javier' },
];

const route: [number, number][] = [
  [41.4036, 2.1744],
  [41.4050, 2.1750],
  [41.4060, 2.1780],
  [41.4080, 2.1790],
  [41.4095, 2.1820],
  [41.4110, 2.1850],
];

const MapRouteDetails: FC = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={[41.4070, 2.1790]}
        zoom={15}
        origin={origin}
        destination={destination}
        route={route}
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/routes')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-6">Detalles de la ruta</h3>
        
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
