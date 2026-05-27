import { FC } from 'react';

interface DirectionCardProps {
  distance: string;
  instruction: string;
  direction?: 'right' | 'left' | 'straight';
  onIconClick?: () => void;
}

export const DirectionCard: FC<DirectionCardProps> = ({
  distance,
  instruction,
  direction = 'right',
  onIconClick,
}) => {
  return (
    <div className="zenit-direction-card bg-card p-5">
      <button
        onClick={onIconClick}
        className="w-12 h-12 rounded-xl bg-popover flex items-center justify-center active:scale-95 transition-transform"
      >
        {direction === 'right' && <TurnRightIcon className="w-8 h-8 text-white" />}
        {direction === 'left' && <TurnLeftIcon className="w-8 h-8 text-white" />}
        {direction === 'straight' && <ArrowUpIcon className="w-8 h-8 text-white" />}
      </button>
      <div className="flex flex-col">
        <span className="text-xl font-semibold">{distance}</span>
        <span className="text-xl font-semibold">{instruction}</span>
      </div>
    </div>
  );
};

function TurnRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18v-6a3 3 0 0 1 3-3h7" />
      <path d="m16 6 3 3-3 3" />
    </svg>
  );
}

function TurnLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18v-6a3 3 0 0 0-3-3H5" />
      <path d="m8 6-3 3 3 3" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
