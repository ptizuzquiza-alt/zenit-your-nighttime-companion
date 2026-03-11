import { FC } from 'react';
import { MapPin, Navigation, ArrowUpDown } from 'lucide-react';

interface LocationInputProps {
  origin: string;
  destination: string;
  onOriginChange?: (value: string) => void;
  onDestinationChange?: (value: string) => void;
  onSwap?: () => void;
  onBack?: () => void;
  activeField?: 'origin' | 'destination';
  onFieldFocus?: (field: 'origin' | 'destination') => void;
}

export const LocationInput: FC<LocationInputProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onBack,
  activeField,
  onFieldFocus,
}) => {
  return (
    <div className="w-full bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border/50">
      <div className="flex gap-3">
        {/* Icons column */}
        <div className="flex flex-col items-center py-3">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
          <div className="w-0.5 h-8 bg-muted-foreground/30 my-1" style={{ 
            backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.3) 0, hsl(var(--muted-foreground) / 0.3) 4px, transparent 4px, transparent 8px)'
          }} />
          <MapPin className="w-4 h-4 text-muted-foreground" />
        </div>
        
        {/* Inputs column */}
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Tu ubicación"
            value={origin}
            onChange={(e) => onOriginChange?.(e.target.value)}
            onFocus={() => onFieldFocus?.('origin')}
            className={`w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none py-2 ${activeField === 'origin' ? 'ring-1 ring-primary/40 rounded-lg px-2 -mx-2' : ''}`}
          />
          <div className="h-px bg-border/50" />
          <input
            type="text"
            placeholder="Destino"
            value={destination}
            onChange={(e) => onDestinationChange?.(e.target.value)}
            onFocus={() => onFieldFocus?.('destination')}
            className={`w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none py-2 ${activeField === 'destination' ? 'ring-1 ring-primary/40 rounded-lg px-2 -mx-2' : ''}`}
          />
        </div>
        
        {/* Swap button */}
        <button 
          onClick={onSwap}
          className="self-center w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
