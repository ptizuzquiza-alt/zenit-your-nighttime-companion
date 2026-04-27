import { FC } from 'react';
import { OriginMarkerIcon } from '@/components/icons/OriginMarkerIcon';

interface LocationMarkerProps {
  type: 'origin' | 'destination' | 'friend' | 'user';
  label?: string;
  style?: React.CSSProperties;
}

export const LocationMarker: FC<LocationMarkerProps> = ({ type, label, style }) => {
  if (type === 'origin') {
    return (
      <div className="absolute flex flex-col items-center" style={style}>
        <OriginMarkerIcon />
        {label && <span className="mt-1 text-xs text-foreground/80">{label}</span>}
      </div>
    );
  }

  if (type === 'destination') {
    return (
      <div className="absolute flex flex-col items-center" style={style}>
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
             style={{ boxShadow: '0 0 12px 3px hsl(45 100% 50% / 0.4)' }}>
          <div className="w-2 h-2 rounded-full bg-background" />
        </div>
        {label && <span className="mt-1 text-xs text-foreground/80">{label}</span>}
      </div>
    );
  }

  if (type === 'friend') {
    return (
      <div className="absolute" style={style}>
        <div className="w-3.5 h-3.5 rounded-full bg-zenit-purple-light"
             style={{ boxShadow: '0 0 10px 3px hsl(265 80% 70% / 0.4)' }} />
      </div>
    );
  }

  // User position (navigation arrow)
  return (
    <div className="absolute" style={style}>
      <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className="drop-shadow-lg">
        <path 
          d="M20 0L40 48L20 36L0 48L20 0Z" 
          fill="hsl(45 100% 50%)"
          style={{ filter: 'drop-shadow(0 4px 8px hsl(45 100% 50% / 0.5))' }}
        />
      </svg>
    </div>
  );
};
