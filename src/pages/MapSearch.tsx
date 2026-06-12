import { FC, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Briefcase, Star, Clock } from 'lucide-react';
import { LocationInput } from '@/components/LocationInput';
import { SearchSuggestion } from '@/components/SearchSuggestion';
import { searchPlaces, storeDestination, storeOrigin, clearOrigin, GeocodingResult } from '@/lib/geocoding';

export interface SavedPlace {
  id: string;
  label: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  icon: 'home' | 'work' | 'star';
}

export interface RecentSearch {
  name: string;
  address: string;
  lat: number;
  lon: number;
}

export const getSavedPlaces = (): SavedPlace[] => {
  try { return JSON.parse(localStorage.getItem('zenit_saved_places') || '[]'); } catch { return []; }
};

export const getRecentSearches = (): RecentSearch[] => {
  try { return JSON.parse(localStorage.getItem('zenit_recent_searches') || '[]'); } catch { return []; }
};

const saveRecentSearch = (result: GeocodingResult) => {
  const recent = getRecentSearches().filter(r => r.name !== result.name);
  const updated = [{ name: result.name, address: result.address ?? '', lat: result.lat, lon: result.lon }, ...recent].slice(0, 5);
  localStorage.setItem('zenit_recent_searches', JSON.stringify(updated));
};

const savedPlaceIcon = (icon: SavedPlace['icon']) => {
  if (icon === 'home') return Home;
  if (icon === 'work') return Briefcase;
  return Star;
};

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
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setSavedPlaces(getSavedPlaces());
    setRecentSearches(getRecentSearches());
  }, []);

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
      saveRecentSearch(result);
      storeDestination({ name: result.name, lat: result.lat, lon: result.lon });
      setDestination(result.name);
      navigate('/routes');
    }
  }, [navigate, activeField]);

  const handleSelectSaved = (place: SavedPlace) => {
    storeDestination({ name: place.name, lat: place.lat, lon: place.lon });
    navigate('/routes');
  };

  const handleSelectRecent = (recent: RecentSearch) => {
    storeDestination({ name: recent.name, lat: recent.lat, lon: recent.lon });
    navigate('/routes');
  };

  const showSuggestions = activeField === 'destination' && destination.length < 2;
  const filteredSaved = savedPlaces.filter(p => p.name.toLowerCase().includes(destination.toLowerCase()) || destination.length < 2);
  const filteredRecent = recentSearches.filter(r => r.name.toLowerCase().includes(destination.toLowerCase()) || destination.length < 2);

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
    <div className="h-[100dvh] bg-background overflow-y-auto">
      {/* Header with back and location input */}
      <div className="p-4 pt-12">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 transition-colors flex items-center justify-center mt-2"
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
          <p className="text-base text-muted-foreground mb-3">Escribe para buscar un origen personalizado</p>
        )}
        {loading && (
          <p className="text-base text-muted-foreground mb-3">Buscando…</p>
        )}
        {!loading && results.length === 0 && activeQuery.length >= 2 && !(activeField === 'origin' && origin === 'Tu ubicación') && (
          <p className="text-base text-muted-foreground mb-3">No se encontraron resultados</p>
        )}

        {/* Search results */}
        {results.length > 0 && (
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
        )}

        {/* Saved places + recents when no active search */}
        {showSuggestions && (
          <>
            {filteredSaved.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Guardados</p>
                <div className="space-y-1 mb-4">
                  {filteredSaved.map(place => {
                    const Icon = savedPlaceIcon(place.icon);
                    return (
                      <button
                        key={place.id}
                        onClick={() => handleSelectSaved(place)}
                        className="zenit-search-item w-full text-left overflow-hidden mx-0 px-[17px]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{place.label}</p>
                            <p className="text-sm text-muted-foreground truncate">{place.name}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {filteredRecent.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recientes</p>
                <div className="space-y-1">
                  {filteredRecent.map((recent, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectRecent(recent)}
                      className="zenit-search-item w-full text-left overflow-hidden mx-0 px-[17px]"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{recent.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{recent.address}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {filteredSaved.length === 0 && filteredRecent.length === 0 && (
              <p className="text-base font-medium text-muted-foreground">Escribe para buscar lugares</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MapSearch;
