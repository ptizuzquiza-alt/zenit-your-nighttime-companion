import { FC } from 'react';
import { Shield, Zap, Train } from 'lucide-react';
import type { TransitLeg } from '@/lib/transit';

interface RouteCardProps {
  type: 'safe' | 'fast';
  distance: string;
  duration: string;
  safetyPercentage: number;
  tags: string[];
  selected?: boolean;
  onClick?: () => void;
  isTransit?: boolean;
  transitLegs?: TransitLeg[];
  transfers?: number;
  walkDistance?: string;
}

const modeIcons: Record<string, string> = {
  SUBWAY: '🚇',
  BUS: '🚌',
  TRAM: '🚊',
  RAIL: '🚆',
  WALK: '🚶',
};

export const RouteCard: FC<RouteCardProps> = ({
  type,
  distance,
  duration,
  safetyPercentage,
  tags,
  selected = false,
  onClick,
  isTransit,
  transitLegs,
  transfers,
  walkDistance,
}) => {
  const isZenit = type === 'safe';
  const Icon = isZenit ? Shield : (isTransit ? Train : Zap);
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
        selected 
          ? isZenit
            ? 'bg-accent/10 border-accent/50 ring-1 ring-accent/30'
            : 'bg-secondary/80 border-muted-foreground/30 ring-1 ring-muted-foreground/20'
          : 'bg-secondary/40 border-border/30 hover:bg-secondary/60'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isZenit ? 'bg-accent/20' : 'bg-muted'
          }`}>
            <Icon className={`w-4 h-4 ${isZenit ? 'text-accent' : 'text-muted-foreground'}`} />
          </div>
          <span className="font-semibold text-foreground">
            {isZenit ? 'Ruta Zenit' : 'Ruta rápida'}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isZenit 
            ? 'bg-accent/20 text-accent' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {safetyPercentage}% segura
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span>{distance}</span>
        <span>•</span>
        <span>{duration}</span>
        {isTransit && transfers !== undefined && (
          <>
            <span>•</span>
            <span>{transfers} transbordo{transfers !== 1 ? 's' : ''}</span>
          </>
        )}
        <span className="ml-1">{isTransit ? '🚇' : '🚶'}</span>
      </div>

      {/* Transit legs summary */}
      {isTransit && transitLegs && transitLegs.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          {transitLegs.map((leg, i) => (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <span className="text-muted-foreground/50 text-xs mx-0.5">→</span>}
              <span
                className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: leg.mode !== 'WALK' && leg.routeColor
                    ? `${leg.routeColor}20`
                    : undefined,
                  color: leg.mode !== 'WALK' && leg.routeColor
                    ? leg.routeColor
                    : undefined,
                }}
              >
                {modeIcons[leg.mode] || '🚶'} {leg.route || (leg.mode === 'WALK' ? `${Math.round(leg.distance)}m` : leg.mode)}
              </span>
            </span>
          ))}
        </div>
      )}
      
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, index) => (
          <span key={index} className="zenit-tag">{tag}</span>
        ))}
      </div>
    </button>
  );
};
