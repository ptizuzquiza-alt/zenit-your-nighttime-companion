import { FC, useState } from 'react';
import { UserX } from 'lucide-react';

interface FriendActivityCardProps {
  name: string;
  avatar?: string;
  activity: string;
  destination: string;
  address: string;
  time: string;
  departureTime?: string;
  estimatedArrival?: string;
  tracking?: boolean;
  onToggleTracking?: () => void;
  onClick?: () => void;
}

export const FriendActivityCard: FC<FriendActivityCardProps> = ({
  name,
  avatar,
  activity,
  destination,
  address,
  time,
  departureTime,
  estimatedArrival,
  tracking = true,
  onToggleTracking,
  onClick
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className={`zenit-friend-activity transition-all ${!tracking ? 'opacity-60' : ''}`}>
        {tracking && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{time}</p>
            {onToggleTracking && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
              >
                <UserX className="w-3 h-3" />
                Dejar de seguir
              </button>
            )}
          </div>
        )}
        <div className="flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={onClick}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} ${avatar ? '' : 'bg-secondary'}`}>
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">{name[0]}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-foreground">
                <span className="font-semibold text-accent">{name}</span>
                <span className="text-muted-foreground"> {activity}</span>
              </p>
              {!tracking && onToggleTracking && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleTracking(); }}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors bg-primary/40 text-primary-foreground border border-primary/60 hover:bg-primary/60"
                >
                  Volver a seguir
                </button>
              )}
            </div>
            {tracking && (
              <>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Hacia <span className="text-foreground font-medium">{destination}</span>, en {address}
                </p>
                {(departureTime || estimatedArrival) && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                    {departureTime && (
                      <span>Salió a las <span className="text-foreground font-medium">{departureTime}</span></span>
                    )}
                    {departureTime && estimatedArrival && <span className="text-border">•</span>}
                    {estimatedArrival && (
                      <span>Llega ~<span className="text-foreground font-medium">{estimatedArrival}</span></span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6" onClick={() => setShowConfirm(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div
            className="relative bg-card border border-border rounded-2xl p-5 w-full max-w-[320px] shadow-xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-foreground font-semibold text-center text-base mb-1">
              ¿Dejar de seguir a {name}?
            </p>
            <p className="text-muted-foreground text-sm text-center mb-5">
              Ya no verás su ruta ni ubicación en el mapa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowConfirm(false); onToggleTracking?.(); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm hover:bg-destructive/90 transition-colors"
              >
                Dejar de seguir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
