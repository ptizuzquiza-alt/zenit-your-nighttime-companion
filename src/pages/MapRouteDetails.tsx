import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { ZenitMap } from '@/components/ZenitMap';
import { BackButton } from '@/components/BackButton';
import { ShareRouteModal } from '@/components/ShareRouteModal';
import { getStoredRoute } from '@/lib/routing';

const contacts = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Carla' },
  { id: '4', name: 'Javier' },
];

const MapRouteDetails: FC = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [sharedContacts, setSharedContacts] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([41.4036, 2.1744]);

  const storedRoute = getStoredRoute();
  const routeCoords = storedRoute?.coordinates ?? [
    [41.4036, 2.1744],
    [41.4110, 2.1850],
  ];

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
  const destination: [number, number] = routeCoords[routeCoords.length - 1] as [number, number];

  const sharedContactNames = contacts.filter(c => sharedContacts.includes(c.id));

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ZenitMap
        center={[
          (origin[0] + destination[0]) / 2,
          (origin[1] + destination[1]) / 2,
        ]}
        zoom={14}
        origin={origin}
        destination={destination}
        route={routeCoords as [number, number][]}
        className="absolute inset-0"
      />

      {/* Back button */}
      <div className="absolute top-12 left-4 z-[1000]">
        <BackButton onClick={() => navigate('/routes')} />
      </div>

      {/* Bottom sheet */}
      <div className="zenit-bottom-sheet p-6 pb-8 z-[1000]">
        <div className="zenit-sheet-handle mb-4" />
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground font-semibold">
            {sessionStorage.getItem('zenit_selected_route_type') === 'fast'
              ? 'Has elegido la Ruta Estándar'
              : 'Has elegido la Ruta Zenit'}
          </h3>
          {sharedContacts.length > 0 && (
            <button
              onClick={() => setShowViewers(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">{sharedContacts.length}</span>
            </button>
          )}
        </div>

        {/* Viewers popover */}
        {showViewers && sharedContactNames.length > 0 && (
          <div className="mb-4 p-4 rounded-2xl bg-secondary/40 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Viendo tu ruta</p>
              <button onClick={() => setShowViewers(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {sharedContactNames.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">{c.name[0]}</span>
                  </div>
                  <span className="text-sm text-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setShowShareModal(true)}
          className="zenit-btn-secondary mb-3"
        >
          Compartir tu ruta
        </button>
        
        <button 
          onClick={() => {
            sessionStorage.setItem('zenit_shared_contacts', JSON.stringify(sharedContacts));
            navigate('/navigation');
          }}
          className="zenit-btn-primary"
        >
          Iniciar el trayecto
        </button>
      </div>

      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(selected) => {
          setSharedContacts(selected);
          setShowShareModal(false);
        }}
        contacts={contacts}
      />
    </div>
  );
};

export default MapRouteDetails;
