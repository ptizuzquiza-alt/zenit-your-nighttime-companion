import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapGrid } from '@/components/MapGrid';
import { BackButton } from '@/components/BackButton';
import { ShareRouteModal } from '@/components/ShareRouteModal';

const contacts = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Carla' },
  { id: '4', name: 'Javier' },
];

const MapRouteDetails: FC = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapGrid className="absolute inset-0">
        {/* Origin marker */}
        <div className="absolute" style={{ top: '25%', left: '15%' }}>
          <div className="w-5 h-5 rounded-full bg-accent shadow-lg"
               style={{ boxShadow: '0 0 16px 4px hsl(45 100% 50% / 0.5)' }} />
        </div>
        
        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <path 
            d="M 60 200 L 60 320 L 140 320 L 140 420 L 240 420 L 240 520"
            className="zenit-route-line"
          />
        </svg>
        
        {/* Destination marker */}
        <div className="absolute" style={{ top: '60%', left: '60%' }}>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
               style={{ boxShadow: '0 0 12px 3px hsl(45 100% 50% / 0.4)' }}>
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
        </div>
      </MapGrid>

      {/* Back button */}
      <div className="absolute top-12 left-4">
        <BackButton onClick={() => navigate('/routes')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8">
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
