import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapGrid } from '@/components/MapGrid';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapGrid className="absolute inset-0">
        {/* Origin marker */}
        <div className="absolute" style={{ top: '25%', left: '20%' }}>
          <div className="w-5 h-5 rounded-full bg-accent shadow-lg"
               style={{ boxShadow: '0 0 16px 4px hsl(45 100% 50% / 0.5)' }} />
        </div>
        
        {/* Route line (main) */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <path 
            d="M 80 200 L 80 280 L 160 280 L 160 380 L 260 380 L 260 470"
            className="zenit-route-line"
          />
          {/* Alternative route */}
          <path 
            d="M 80 200 L 140 200 L 140 320 L 200 320 L 200 400 L 260 400 L 260 470"
            className="zenit-route-line-alt"
          />
        </svg>
        
        {/* Destination marker */}
        <div className="absolute" style={{ top: '55%', left: '65%' }}>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
               style={{ boxShadow: '0 0 12px 3px hsl(45 100% 50% / 0.4)' }}>
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
        </div>
      </MapGrid>

      {/* Back button */}
      <div className="absolute top-12 left-4">
        <BackButton onClick={() => navigate('/search')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8">
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
