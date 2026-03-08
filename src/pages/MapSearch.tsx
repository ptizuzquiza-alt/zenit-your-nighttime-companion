import { FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { SearchSuggestion } from '@/components/SearchSuggestion';
import { searchPlaces, storeDestination, GeocodingResult } from '@/lib/geocoding';

const MapSearch: FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Tu ubicación');
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Get user location for distance calc
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchPlaces(destination, userLocation?.lat, userLocation?.lon).then((res) => {
        setResults(res);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [destination, userLocation]);

  const handleSelectDestination = useCallback((result: GeocodingResult) => {
    storeDestination({ name: result.name, lat: result.lat, lon: result.lon });
    setDestination(result.name);
    navigate('/routes');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back and location input */}
      <div className="p-4 pt-12">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center mt-2"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <LocationInput
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwap={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
            />
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="px-4 pt-4">
        {loading && (
          <p className="text-sm text-muted-foreground mb-3">Buscando…</p>
        )}
        {!loading && results.length === 0 && destination.length >= 2 && (
          <p className="text-sm text-muted-foreground mb-3">No se encontraron resultados</p>
        )}
        {!loading && results.length === 0 && destination.length < 2 && (
          <p className="text-sm font-medium text-muted-foreground mb-3">Escribe para buscar lugares</p>
        )}
        <div className="space-y-1">
          {results.map(result => (
            <SearchSuggestion
              key={result.id}
              name={result.name}
              address={result.address}
              distance={result.distance || ''}
              onClick={() => handleSelectDestination(result)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
