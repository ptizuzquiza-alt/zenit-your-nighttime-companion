import { FC } from 'react';

interface LuciTutorialProps {
  message: string;
  onClose: () => void;
  showPortrait?: boolean;
}

const LuciHablandoTrazo = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <path
      d="M36.4512 4.68283C37.2626 4.21459 38.3 4.49272 38.7686 5.30393C40.9123 9.0172 41.0266 13.0427 40.3779 16.4533C40.0236 18.3157 39.4338 20.0381 38.7832 21.4973C40.9941 22.7932 42.8991 24.5538 44.3643 26.6457L54.7363 29.425C53.7123 33.1467 50.9473 35.9265 47.5586 37.1242C47.39 46.774 39.5171 54.5442 29.8271 54.5442C20.1253 54.5439 12.2432 46.7544 12.0938 37.0881C8.74376 35.8745 6.01583 33.1106 5 29.4201L15.2764 26.6662C16.5769 24.8039 18.2252 23.2025 20.1279 21.9572C19.3951 20.4059 18.7145 18.5152 18.3223 16.4533C17.6736 13.0427 17.7879 9.0172 19.9316 5.30393C20.4001 4.49264 21.4376 4.21472 22.249 4.68283C23.0605 5.15131 23.3393 6.1887 22.8711 7.00021C21.2558 9.79801 21.1069 12.93 21.6562 15.8186C21.9808 17.5246 22.542 19.0948 23.1367 20.3781C25.2014 19.5365 27.46 19.0725 29.8271 19.0725C31.8866 19.0725 33.8642 19.4241 35.7031 20.0696C36.2448 18.8465 36.7459 17.3903 37.0449 15.8186C37.5942 12.9301 37.4453 9.79796 35.8301 7.00021C35.3618 6.18873 35.6398 5.15138 36.4512 4.68283Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const LuciHablando = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <path d="M24.3669 22.5996L25.3172 24.0054L22.5057 25.906L21.5554 24.5003L22.9612 23.55L24.3669 22.5996ZM19.9319 5.30393C20.4004 4.49235 21.4382 4.21429 22.2498 4.68285C23.0614 5.15142 23.3394 6.18918 22.8709 7.00076L21.4014 6.15234L19.9319 5.30393ZM22.9612 23.55L21.5554 24.5003C20.3965 22.786 18.9687 19.8515 18.3222 16.4526C17.6735 13.0419 17.788 9.01729 19.9319 5.30393L21.4014 6.15234L22.8709 7.00076C21.2555 9.79869 21.1067 12.9299 21.6561 15.8185C22.2078 18.7191 23.4395 21.2278 24.3669 22.5996L22.9612 23.55Z" fill="#AE99FF" />
    <path d="M34.3338 22.5996L33.3835 24.0054L36.195 25.906L37.1453 24.5003L35.7395 23.55L34.3338 22.5996ZM38.7688 5.30393C38.3002 4.49235 37.2625 4.21429 36.4509 4.68285C35.6393 5.15142 35.3613 6.18918 35.8298 7.00076L37.2993 6.15234L38.7688 5.30393ZM35.7395 23.55L37.1453 24.5003C38.3042 22.786 39.732 19.8515 40.3785 16.4526C41.0272 13.0419 40.9127 9.01729 38.7688 5.30393L37.2993 6.15234L35.8298 7.00076C37.4452 9.79869 37.594 12.9299 37.0446 15.8185C36.4929 18.7191 35.2612 21.2278 34.3338 22.5996L35.7395 23.55Z" fill="#AE99FF" />
    <circle cx="29.8276" cy="36.8084" r="17.7363" fill="#5E33FF" />
    <path d="M26.9465 23.5394C28.5204 29.5767 24.9295 35.761 18.8936 37.3784C12.8576 38.9957 6.65564 35.4353 5 29.4199L26.9465 23.5394Z" fill="white" />
    <path d="M20.9581 25.1482C21.6974 27.9072 20.06 30.7432 17.3011 31.4824C14.5422 32.2215 11.707 30.584 10.9678 27.8251L10.9673 27.8232L20.9576 25.1463L20.9581 25.1482Z" fill="#131927" />
    <path d="M54.7366 29.4255C53.0813 35.4413 46.8789 39.002 40.8427 37.3849C34.8065 35.7675 31.2156 29.5825 32.79 23.5449L54.7366 29.4255Z" fill="white" />
    <path d="M48.7481 27.8227C48.0089 30.5816 45.1729 32.219 42.4139 31.4797C39.6551 30.7403 38.0176 27.9044 38.7568 25.1455L48.7481 27.8227Z" fill="#131927" />
    <path d="M32.5659 40.0947C31.4196 40.8351 28.7355 41.2758 27.1421 39.1152" stroke="#FE80D8" strokeWidth="6.02372" strokeLinecap="round" />
    <path d="M33.5244 42.9552C31.5893 40.9686 26.5465 40.0835 24.2693 39.8792C25.0008 42.2303 27.5993 43.288 28.9612 43.5407C31.4558 44.1062 33.2323 43.1641 33.5244 42.9552Z" fill="#E4029F" stroke="#E4029F" strokeWidth="0.0848412" />
  </svg>
);

const Triangle = () => (
  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-popover">
    <path d="M12.9905 13.5L25.9809 0H9.72748e-05L12.9905 13.5Z" fill="currentColor" />
  </svg>
);

export const LuciTutorial: FC<LuciTutorialProps> = ({ message, onClose, showPortrait = false }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2">
        {showPortrait && (
          <div className="relative h-[60px] w-[60px] shrink-0">
            <div className="absolute inset-0 text-[#332D54]">
              <LuciHablandoTrazo />
            </div>
            <div className="relative z-10 h-full w-full text-white">
              <LuciHablando />
            </div>
          </div>
        )}

        <div className="relative flex-1 min-w-0 rounded-[28px] border-2 border-background bg-popover px-4 py-4 shadow-xl">
          <div className="absolute left-0 top-1/2 flex h-[14px] w-[13px] -translate-x-1/2 -translate-y-1/2 items-center overflow-hidden rounded-[2px]">
            <Triangle />
          </div>

          <div className="flex items-start gap-2">
            <p className="h-fit w-full flex-1 text-sm font-medium leading-snug text-foreground">
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
