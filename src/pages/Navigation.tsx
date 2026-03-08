import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapGrid } from '@/components/MapGrid';
import { DirectionCard } from '@/components/DirectionCard';
import { FriendActivityCard } from '@/components/FriendActivityCard';
import { NavigationFab } from '@/components/NavigationFab';

const Navigation: FC = () => {
  const navigate = useNavigate();
  const [showFriendActivity, setShowFriendActivity] = useState(true);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapGrid className="absolute inset-0">
        {/* User position (navigation arrow) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
            <path 
              d="M24 0L48 56L24 42L0 56L24 0Z" 
              fill="hsl(45 100% 50%)"
              style={{ filter: 'drop-shadow(0 4px 12px hsl(45 100% 50% / 0.6))' }}
            />
          </svg>
        </div>
        
        {/* Route lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {/* Main route ahead */}
          <path 
            d="M 200 420 L 200 300 L 280 300 L 280 180 L 350 180"
            className="zenit-route-line"
          />
          {/* Route behind (dimmed) */}
          <path 
            d="M 100 600 L 100 500 L 200 500 L 200 420"
            stroke="hsl(0 0% 100% / 0.3)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        
        {/* Friend markers */}
        <div className="absolute" style={{ top: '35%', left: '70%' }}>
          <div className="w-3.5 h-3.5 rounded-full bg-zenit-purple-light animate-pulse"
               style={{ boxShadow: '0 0 10px 3px hsl(265 80% 70% / 0.5)' }} />
        </div>
        <div className="absolute" style={{ top: '45%', left: '75%' }}>
          <div className="w-3.5 h-3.5 rounded-full bg-zenit-purple-light animate-pulse"
               style={{ boxShadow: '0 0 10px 3px hsl(265 80% 70% / 0.5)' }} />
        </div>
        
        {/* Destination marker */}
        <div className="absolute" style={{ top: '20%', left: '85%' }}>
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
               style={{ boxShadow: '0 0 12px 3px hsl(45 100% 50% / 0.4)' }}>
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
        </div>
        
        {/* Map toggle FAB */}
        <div className="absolute bottom-48 right-4">
          <NavigationFab mode="map" />
        </div>
      </MapGrid>

      {/* Direction card */}
      <div className="absolute top-12 left-4 right-4">
        <DirectionCard
          distance="Siga 900 m y"
          instruction="gire a la derecha"
          direction="right"
        />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8">
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
