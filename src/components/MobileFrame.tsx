import { FC, ReactNode, useEffect, useState } from 'react';
import luciImg from '@/assets/luci-hablando.svg';

const useIsDesktop = () => {
  const detect = () => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const wide = window.innerWidth >= 900;
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

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

const MobileBehavior: FC = () => {
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    if (isIOS()) {
      // Show "Add to Home Screen" banner after 2s if not already dismissed
      const dismissed = sessionStorage.getItem('zenit_ios_banner_dismissed');
      if (!dismissed) {
        const t = setTimeout(() => setShowIOSBanner(true), 2000);
        return () => clearTimeout(t);
      }
    } else {
      // Android / Chrome — request fullscreen on first tap
      const requestFS = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        document.removeEventListener('touchstart', requestFS);
      };
      document.addEventListener('touchstart', requestFS, { once: true });
      return () => document.removeEventListener('touchstart', requestFS);
    }
  }, []);

  if (!showIOSBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-8 pt-4"
      style={{ background: 'linear-gradient(to top, rgba(14,10,31,0.98) 80%, transparent)' }}
    >
      <div className="flex items-start gap-3 bg-card border border-border rounded-2xl px-4 py-3.5 shadow-xl">
        <img src={luciImg} alt="Luci" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Añade Zenit a tu inicio</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pulsa <span className="text-primary">Compartir</span> y luego <span className="text-primary">"Añadir a pantalla de inicio"</span> para una experiencia sin barra del navegador.
          </p>
        </div>
        <button
          onClick={() => {
            sessionStorage.setItem('zenit_ios_banner_dismissed', '1');
            setShowIOSBanner(false);
          }}
          className="text-muted-foreground text-lg leading-none flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const MobileFrame: FC<{ children: ReactNode }> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <div className="w-full min-h-[100dvh] bg-background overflow-hidden">
        {children}
        <MobileBehavior />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, hsl(265 60% 18%) 0%, hsl(249 42% 8%) 70%)' }}
    >
      {/* Wordmark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 select-none">
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
          style={{ inset: 2, borderRadius: 52, background: 'hsl(249 42% 12%)' }}
        >
          {/* Dynamic island */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{ top: 14, width: 126, height: 37, borderRadius: 20, background: '#0a0a0f' }}
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
