import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapGrid } from '@/components/MapGrid';
import { SearchBar } from '@/components/SearchBar';
import { SafePlaceCard } from '@/components/SafePlaceCard';
import { NavigationFab } from '@/components/NavigationFab';

const MapIdle: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapGrid className="absolute inset-0">
        {/* User location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-accent shadow-lg animate-pulse-glow"
               style={{ boxShadow: '0 0 20px 6px hsl(45 100% 50% / 0.4)' }} />
        </div>
        
        {/* Locate me FAB */}
        <div className="absolute bottom-48 right-4">
          <button className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </button>
        </div>
      </MapGrid>

      {/* Search bar overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12">
        <SearchBar 
          placeholder="Buscar" 
          onClick={() => navigate('/search')}
          readOnly
        />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-4">Sitios seguros cercanos</h3>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
          <SafePlaceCard />
          <SafePlaceCard />
          <SafePlaceCard />
          <SafePlaceCard />
        </div>
      </div>
    </div>
  );
};

export default MapIdle;
