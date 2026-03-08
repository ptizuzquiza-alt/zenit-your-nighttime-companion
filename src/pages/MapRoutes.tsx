import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZenitMap } from '@/components/ZenitMap';
import { RouteCard } from '@/components/RouteCard';
import { BackButton } from '@/components/BackButton';
import { fetchWalkingRoute, storeSelectedRoute, RouteResult } from '@/lib/routing';

const MapRoutes: FC = () => {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'fast'>('safe');
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(true);

  const destination: [number, number] = [41.4110, 2.1850];

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        }
      );
    }
  }, []);

  // Fetch real routes when origin changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchWalkingRoute(userLocation, destination, true).then((results) => {
      if (cancelled) return;
      setRoutes(results);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [userLocation[0], userLocation[1]]);

  const safeRoute = routes[0];
  const fastRoute = routes[1] || routes[0];

  const currentRouteData = selectedRoute === 'safe' ? safeRoute : fastRoute;
  const alternativeRouteData = selectedRoute === 'safe' ? fastRoute : safeRoute;

  const formatDistance = (m: number) => `${(m / 1000).toFixed(1)} km`;
  const formatDuration = (s: number) => `${Math.round(s / 60)} min`;

  const handleContinue = () => {
    if (currentRouteData) {
      storeSelectedRoute(currentRouteData);
    }
    navigate('/route-details');
  };

  // Compute map center from route bounds
  const mapCenter: [number, number] = safeRoute?.coordinates?.length
    ? [
        (userLocation[0] + destination[0]) / 2,
        (userLocation[1] + destination[1]) / 2,
      ]
    : [41.4070, 2.1790];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={mapCenter}
        zoom={14}
        origin={userLocation}
        destination={destination}
        route={currentRouteData?.coordinates}
        alternativeRoute={alternativeRouteData?.coordinates}
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/search')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <h3 className="text-foreground font-semibold mb-4">Elige tu ruta</h3>
        
        {loading ? (
          <p className="text-muted-foreground text-sm">Calculando rutas reales…</p>
        ) : (
          <div className="space-y-3">
            <RouteCard
              type="safe"
              distance={safeRoute ? formatDistance(safeRoute.distance) : '—'}
              duration={safeRoute ? formatDuration(safeRoute.duration) : '—'}
              safetyPercentage={95}
              tags={['Calles bien iluminadas', 'Áreas activas']}
              selected={selectedRoute === 'safe'}
              onClick={() => setSelectedRoute('safe')}
            />
            {routes.length > 1 && (
              <RouteCard
                type="fast"
                distance={formatDistance(fastRoute.distance)}
                duration={formatDuration(fastRoute.duration)}
                safetyPercentage={73}
                tags={['Menor distancia', 'Menos peatones']}
                selected={selectedRoute === 'fast'}
                onClick={() => setSelectedRoute('fast')}
              />
            )}
          </div>
        )}
        
        <button 
          onClick={handleContinue}
          className="zenit-btn-primary mt-4"
          disabled={loading}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default MapRoutes;
