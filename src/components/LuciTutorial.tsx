import { FC } from 'react';
import luciHablandoRaw from '@/assets/luci-hablando.svg?raw';
import luciHablandoTrazoRaw from '@/assets/luci-hablando-trazo.svg?raw';

interface LuciTutorialProps {
  message: string;
  onClose: () => void;
  showPortrait?: boolean;
}

const SvgAsset = ({ raw, className }: { raw: string; className?: string }) => (
  <span className={className} dangerouslySetInnerHTML={{ __html: raw }} />
);

const Triangle = () => (
  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-popover">
    <path
      d="M2 0H24A2 2 0 0 1 26 2L14.3775 12.06A2 2 0 0 1 11.6035 12.06L0 2A2 2 0 0 1 2 0Z"
      fill="currentColor"
      stroke="hsl(var(--background))"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const LuciTutorial: FC<LuciTutorialProps> = ({ message, onClose, showPortrait = false }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-4">
        {showPortrait && (
          <div className="relative h-[60px] w-[60px] shrink-0">
            <div className="absolute inset-0 text-[#332D54] [&_path]:stroke-[#332D54] [&_path]:stroke-[4px]">
              <SvgAsset raw={luciHablandoTrazoRaw} className="block h-full w-full" />
            </div>
            <div className="relative z-10 h-full w-full text-white">
              <SvgAsset raw={luciHablandoRaw} className="block h-full w-full" />
            </div>
          </div>
        )}

        <div className="relative flex-1 min-w-0 rounded-xl border-2 border-background bg-popover px-4 py-4 shadow-xl">
          <div className="absolute left-0 top-1/2 h-[14px] w-[13px] -translate-x-[13px] overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[26px]">
              <Triangle />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="h-fit w-full flex-1 text-sm font-regular leading-snug text-foreground">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl px-2 py-2 text-sm font-semibold leading-none text-accent transition-colors hover:bg-background/10"
            >
              ¡Vale!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
