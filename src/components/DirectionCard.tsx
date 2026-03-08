import { FC } from 'react';
import { TurnRight, TurnLeft, ArrowUp } from 'lucide-react';

interface DirectionCardProps {
  distance: string;
  instruction: string;
  direction?: 'right' | 'left' | 'straight';
}

export const DirectionCard: FC<DirectionCardProps> = ({ 
  distance, 
  instruction, 
  direction = 'right' 
}) => {
  const DirectionIcon = direction === 'right' ? TurnRight : direction === 'left' ? TurnLeft : ArrowUp;

  return (
    <div className="zenit-direction-card">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
        <DirectionIcon className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-white/90 text-lg font-semibold">{distance}</span>
        <span className="text-white/70 text-sm">{instruction}</span>
      </div>
    </div>
  );
};

// Custom TurnRight icon
function TurnRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18v-6a3 3 0 0 1 3-3h7" />
      <path d="m16 6 3 3-3 3" />
    </svg>
  );
}

function TurnLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18v-6a3 3 0 0 0-3-3H5" />
      <path d="m8 6-3 3 3 3" />
    </svg>
  );
}

function ArrowUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
