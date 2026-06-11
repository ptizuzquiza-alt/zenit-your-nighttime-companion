import { FC, ReactNode, useEffect, useState } from 'react';

const useIsDesktop = () => {
  const detect = () => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const wide = window.innerWidth >= 900;
    // On real mobile browsers pointer is coarse; on desktop it's fine.
    // Use width as fallback for environments where pointer query is unreliable.
    return !coarse || wide;
  };

  const [isDesktop, setIsDesktop] = useState(detect);

  useEffect(() => {
    const check = () => setIsDesktop(detect());
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isDesktop;
};

export const MobileFrame: FC<{ children: ReactNode }> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div className="w-full min-h-[100dvh] bg-background overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, hsl(265 60% 18%) 0%, hsl(249 42% 8%) 70%)' }}
    >
      {/* Wordmark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none">
        <span className="text-white/20 font-semibold text-sm tracking-widest uppercase">Zenit</span>
      </div>

      {/* Phone shell */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 390,
          height: 844,
          borderRadius: 54,
          background: '#0a0a0f',
          boxShadow: `
            0 0 0 1.5px #2a2a3a,
            0 0 0 3px #111118,
            0 0 0 4px #2a2a3a,
            0 40px 80px rgba(0,0,0,0.7),
            0 0 60px rgba(100,80,200,0.08)
          `,
        }}
      >
        {/* Side buttons — volume */}
        <div className="absolute -left-[3px] top-28 w-[3px] h-8 rounded-l-full" style={{ background: '#1e1e2a' }} />
        <div className="absolute -left-[3px] top-44 w-[3px] h-14 rounded-l-full" style={{ background: '#1e1e2a' }} />
        <div className="absolute -left-[3px] top-60 w-[3px] h-14 rounded-l-full" style={{ background: '#1e1e2a' }} />
        {/* Power button */}
        <div className="absolute -right-[3px] top-40 w-[3px] h-20 rounded-r-full" style={{ background: '#1e1e2a' }} />

        {/* Screen area */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: 2,
            borderRadius: 52,
            background: 'hsl(249 42% 12%)',
          }}
        >
          {/* Dynamic island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{
              top: 14,
              width: 126,
              height: 37,
              borderRadius: 20,
              background: '#0a0a0f',
            }}
          />

          {/* App content */}
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        </div>

        {/* Screen glare */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 2,
            borderRadius: 52,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
          }}
        />
      </div>
    </div>
  );
};
