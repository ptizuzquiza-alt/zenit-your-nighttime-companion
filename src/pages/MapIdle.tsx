import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { SearchBar } from '@/components/SearchBar';
import { SafePlaceCard } from '@/components/SafePlaceCard';

const MapIdle: FC = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);

  // Get user's real location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // Keep default Barcelona location
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Real map */}
      <ZenitMap
        center={userLocation}
        zoom={16}
        origin={userLocation}
        className="absolute inset-0" />
      

      {/* Search bar overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 z-[1000]">
        <SearchBar
          placeholder="Buscar"
          onClick={() => navigate('/search')}
          readOnly />
        
      </div>

      {/* Locate me FAB */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <button
          onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setUserLocation([position.coords.latitude, position.coords.longitude]);
                }
              );
            }
          }}
          className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
          
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      










      
    </div>);

};

export default MapIdle;