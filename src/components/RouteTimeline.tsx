import { FC } from 'react';

import type { RouteStep } from '@/lib/routing';

interface RouteTimelineProps {
  originLabel: string;
  destinationLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  steps: RouteStep[];
}

export const RouteTimeline: FC<RouteTimelineProps> = ({
  originLabel,
  destinationLabel,
  startTimeLabel,
  endTimeLabel,
  steps,
}) => {
  const formatStepDistance = (distance: number) => {
    if (distance > 999) {
      return `${(distance / 1000).toFixed(1)} kilómetro`;
    }

    return `${Math.round(distance)} metros`;
  };

  return (
    <div className="space-y-0">
      <TimelineStop
        label={originLabel}
        timeLabel={startTimeLabel}
        variant="start"
      />

      {steps.map((step, index) => (
        <div key={`${step.instruction}-${index}`}>
          <TimelineDistance distance={formatStepDistance(step.distance)} />
          <TimelineInstruction
            instruction={step.instruction}
            direction={step.direction}
          />
        </div>
      ))}

      <TimelineStop
        label={destinationLabel}
        timeLabel={endTimeLabel}
        variant="end"
      />
    </div>
  );
};

function TimelineStop({
  label,
  timeLabel,
  variant,
}: {
  label: string;
  timeLabel: string;
  variant: 'start' | 'end';
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="flex w-7 shrink-0 justify-center pt-0.5">
        {variant === 'start' ? <CurrentLocationIcon /> : <DestinationIcon />}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-[1.05rem] font-medium leading-tight text-white sm:text-lg">
          {label}
        </p>
        <span className="shrink-0 text-sm font-medium text-white/85">
          {timeLabel}
        </span>
      </div>
    </div>
  );
}

function TimelineDistance({ distance }: { distance: string }) {
  return (
    <div className="flex gap-3 py-4">
      <div className="flex w-7 shrink-0 justify-center">
        <div className="h-full min-h-5 border-l-4 border-dotted border-white/30" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-tight text-white/78">
          {distance}
        </p>
      </div>
    </div>
  );
}

function TimelineInstruction({
  instruction,
  direction,
}: {
  instruction: string;
  direction: 'right' | 'left' | 'straight';
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex w-8 shrink-0 justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5a5384] text-white shadow-[0_4px_14px_-4px_hsla(240,25%,5%,0.45)]">
          {direction === 'right' && <TurnRightIcon className="h-4.5 w-4.5" />}
          {direction === 'left' && <TurnLeftIcon className="h-4.5 w-4.5" />}
          {direction === 'straight' && <ArrowUpIcon className="h-4.5 w-4.5" />}
        </div>
      </div>
      <p className="min-w-0 flex-1 text-[1.05rem] leading-tight text-white sm:text-lg">
        {instruction}
      </p>
    </div>
  );
}

function CurrentLocationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#F7F7F7" />
      <path d="M12 19V21" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12H3" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5V3" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H21" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DestinationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10C20 14.4183 12 22 12 22C12 22 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="#F7F7F7" strokeWidth="1.5" />
      <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" fill="#F7F7F7" stroke="#F7F7F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TurnRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18v-6a3 3 0 0 1 3-3h7" />
      <path d="m16 6 3 3-3 3" />
    </svg>
  );
}

function TurnLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18v-6a3 3 0 0 0-3-3H5" />
      <path d="m8 6-3 3 3 3" />
    </svg>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}