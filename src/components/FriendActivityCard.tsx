import { FC } from 'react';
import { EyeOff, Eye } from 'lucide-react';

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
  return (
    <div className={`zenit-friend-activity transition-all ${!tracking ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{time}</p>
        {onToggleTracking && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleTracking(); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              tracking
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-secondary text-muted-foreground border border-border'
            }`}
          >
            {tracking ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {tracking ? 'Siguiendo' : 'Detenido'}
          </button>
        )}
      </div>
      <div className="flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform" onClick={onClick}>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">{name[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-foreground">
            <span className="font-semibold text-accent">{name}</span>
            <span className="text-muted-foreground"> {activity}</span>
          </p>
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
        </div>
      </div>
    </div>
  );
};
