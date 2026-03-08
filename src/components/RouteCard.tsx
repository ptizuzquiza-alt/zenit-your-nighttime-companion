import { FC } from 'react';
import { Shield, Zap } from 'lucide-react';

interface RouteCardProps {
  type: 'safe' | 'fast';
  distance: string;
  duration: string;
  safetyPercentage: number;
  tags: string[];
  selected?: boolean;
  onClick?: () => void;
}

export const RouteCard: FC<RouteCardProps> = ({
  type,
  distance,
  duration,
  safetyPercentage,
  tags,
  selected = false,
  onClick
}) => {
  const isSafe = type === 'safe';
  const Icon = isSafe ? Shield : Zap;
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
        selected 
          ? 'bg-secondary/80 border-primary/50 ring-1 ring-primary/30' 
          : 'bg-secondary/40 border-border/30 hover:bg-secondary/60'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSafe ? 'bg-zenit-green/20' : 'bg-zenit-yellow/20'
          }`}>
            <Icon className={`w-4 h-4 ${isSafe ? 'text-zenit-green' : 'text-zenit-yellow'}`} />
          </div>
          <span className="font-semibold text-foreground">
            {isSafe ? 'Ruta Segura' : 'Ruta Rápida'}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isSafe 
            ? 'bg-zenit-green/20 text-zenit-green' 
            : 'bg-zenit-yellow/20 text-zenit-yellow'
        }`}>
          {safetyPercentage}% segura
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span>{distance}</span>
        <span>•</span>
        <span>{duration}</span>
        <span className="ml-1">🚶</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, index) => (
          <span key={index} className="zenit-tag">{tag}</span>
        ))}
      </div>
    </button>
  );
};
