import { FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { SearchSuggestion } from '@/components/SearchSuggestion';
import { searchPlaces, storeDestination, storeOrigin, clearOrigin, GeocodingResult } from '@/lib/geocoding';

type ActiveField = 'origin' | 'destination';

const MapSearch: FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Tu ubicación');
  const [destination, setDestination] = useState('');
  const [activeField, setActiveField] = useState<ActiveField>('destination');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [customOrigin, setCustomOrigin] = useState<GeocodingResult | null>(null);

  // Get user location for distance calc
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  const activeQuery = activeField === 'origin' ? origin : destination;

  // Debounced search
  useEffect(() => {
    // Don't search if origin field shows default text
    if (activeField === 'origin' && origin === 'Tu ubicación') {
      setResults([]);
      return;
    }

    if (!activeQuery || activeQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      searchPlaces(activeQuery, userLocation?.lat, userLocation?.lon).then((res) => {
        setResults(res);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [activeQuery, userLocation, activeField, origin]);

  const handleSelectResult = useCallback((result: GeocodingResult) => {
    if (activeField === 'origin') {
      setOrigin(result.name);
      setCustomOrigin(result);
      storeOrigin({ name: result.name, lat: result.lat, lon: result.lon });
      setResults([]);
      setActiveField('destination');
    } else {
      storeDestination({ name: result.name, lat: result.lat, lon: result.lon });
      setDestination(result.name);
      navigate('/routes');
    }
  }, [navigate, activeField]);

  const handleOriginChange = (value: string) => {
    setOrigin(value);
    setActiveField('origin');
    if (value === '' || value.length < 2) {
      setCustomOrigin(null);
      clearOrigin();
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setActiveField('destination');
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    const tempCustomOrigin = customOrigin;
    setOrigin(destination);
    setDestination(tempOrigin);
    // Swap stored data too
    if (tempCustomOrigin) {
      storeDestination({ name: tempCustomOrigin.name, lat: tempCustomOrigin.lat, lon: tempCustomOrigin.lon });
    }
    setCustomOrigin(null);
    clearOrigin();
  };

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
              onOriginChange={handleOriginChange}
              onDestinationChange={handleDestinationChange}
              onSwap={handleSwap}
              activeField={activeField}
              onFieldFocus={setActiveField}
            />
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="px-4 pt-4">
        {activeField === 'origin' && origin === 'Tu ubicación' && (
          <p className="text-sm text-muted-foreground mb-3">Escribe para buscar un origen personalizado</p>
        )}
        {loading && (
          <p className="text-sm text-muted-foreground mb-3">Buscando…</p>
        )}
        {!loading && results.length === 0 && activeQuery.length >= 2 && !(activeField === 'origin' && origin === 'Tu ubicación') && (
          <p className="text-sm text-muted-foreground mb-3">No se encontraron resultados</p>
        )}
        {!loading && results.length === 0 && activeQuery.length < 2 && activeField === 'destination' && (
          <p className="text-sm font-medium text-muted-foreground mb-3">Escribe para buscar lugares</p>
        )}
        <div className="space-y-1">
          {results.map(result => (
            <SearchSuggestion
              key={result.id}
              name={result.name}
              address={result.address}
              distance={result.distance || ''}
              onClick={() => handleSelectResult(result)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
