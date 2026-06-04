import { FC, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Camina con luz propia',
    subtitle: 'Deja que Zenit guíe tus pasos en la oscuridad de la ciudad',
    illustration: 'city',
  },
  {
    id: 'safe-route',
    title: 'Siempre la ruta\nmás segura',
    subtitle: 'Consulta el mapa, elige tu destino y sigue la ruta diseñada para que llegues con mayor tranquilidad.',
    illustration: 'route',
  },
  {
    id: 'friends-route',
    title: 'Visualiza la ruta de\ntus amigos',
    subtitle: 'Cuando tus amigos compartan su trayecto contigo, podrás ver su ruta en tiempo real directamente en el\u00A0mapa.',
    illustration: 'friends',
  },
  {
    id: 'trust-network',
    title: 'Tu red de confianza',
    subtitle: 'Agrega a tus amigos y comparte tu ruta para que puedan seguir tu recorrido en tiempo real.',
    illustration: 'share',
  },
];

const TOTAL = SLIDES.length + 1; // 4 slides + login
const SWIPE_THRESHOLD = 60;

// ─── Illustrations ──────────────────────────────────────────────

const RouteIllustration: FC = () => (
  <svg viewBox="0 0 280 200" className="w-full h-full" fill="none">
    {[0, 40, 80, 120, 160, 200].map((y) => (
      <line key={`h${y}`} x1="0" y1={y} x2="280" y2={y} stroke="hsl(249 30% 25%)" strokeWidth="0.8" />
    ))}
    {[0, 40, 80, 120, 160, 200, 240, 280].map((x) => (
      <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="hsl(249 30% 25%)" strokeWidth="0.8" />
    ))}
    <polyline points="60,160 60,120 100,120 100,80 140,80 140,40 180,40" stroke="hsl(45 100% 50%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="60" cy="160" r="10" fill="hsl(45 100% 50%)" />
    <circle cx="60" cy="160" r="5" fill="hsl(249 42% 12%)" />
    <circle cx="60" cy="160" r="16" fill="hsl(45 100% 50% / 0.2)" />
    <path d="M180 40 m-8-12 a8 8 0 1 1 16 0 c0 6-8 20-8 20 s-8-14-8-20 z" fill="hsl(45 100% 50%)" />
    <circle cx="180" cy="28" r="3" fill="hsl(249 42% 12%)" />
  </svg>
);

const FriendsIllustration: FC = () => (
  <svg viewBox="0 0 280 200" className="w-full h-full" fill="none">
    {[0, 40, 80, 120, 160, 200].map((y) => (
      <line key={`h${y}`} x1="0" y1={y} x2="280" y2={y} stroke="hsl(249 30% 25%)" strokeWidth="0.8" />
    ))}
    {[0, 40, 80, 120, 160, 200, 240, 280].map((x) => (
      <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="hsl(249 30% 25%)" strokeWidth="0.8" />
    ))}
    <polyline points="200,40 200,80 160,80 160,120 120,120 120,160 80,160" stroke="hsl(265 90% 60%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8,4" />
    <circle cx="150" cy="100" r="12" fill="hsl(265 90% 60%)" />
    <circle cx="150" cy="100" r="5" fill="white" />
    <circle cx="150" cy="100" r="20" fill="hsl(265 90% 60% / 0.2)" />
    <path d="M80 160 m-8-12 a8 8 0 1 1 16 0 c0 6-8 20-8 20 s-8-14-8-20 z" fill="hsl(265 90% 60%)" />
    <circle cx="80" cy="148" r="3" fill="hsl(249 42% 12%)" />
    <circle cx="200" cy="40" r="8" fill="hsl(249 40% 30%)" stroke="hsl(265 90% 60%)" strokeWidth="2" />
    <circle cx="200" cy="40" r="3" fill="hsl(265 90% 60%)" />
  </svg>
);

const ShareIllustration: FC = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="bg-card/90 border border-border rounded-2xl p-4 w-[220px] shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-foreground font-semibold">Compartir tu ruta</span>
        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-[8px] text-muted-foreground">✕</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3 leading-tight">
        Selecciona las personas que podrán acompañar tu ruta hasta que llegues a tu destino.
      </p>
      <div className="bg-secondary rounded-xl px-3 py-1.5 text-[11px] text-muted-foreground mb-3">Buscar</div>
      <p className="text-[10px] text-muted-foreground mb-2">Recientes</p>
      {[
        { name: 'Juan', checked: true, color: 'bg-blue-400' },
        { name: 'María', checked: true, color: 'bg-pink-400' },
        { name: 'Celia', checked: false, color: 'bg-green-400' },
        { name: 'Javier', checked: false, color: 'bg-orange-400' },
      ].map((contact) => (
        <div key={contact.name} className="flex items-center gap-2 py-1.5">
          <div className={`w-6 h-6 rounded-full ${contact.color} flex-shrink-0`} />
          <span className="text-[11px] text-foreground flex-1">{contact.name}</span>
          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${contact.checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
            {contact.checked && <span className="text-[8px] text-white">✓</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Dot indicator ──────────────────────────────────────────────

const Dots: FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex gap-2 items-center justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current ? 'w-6 h-2 bg-accent' : 'w-2 h-2 bg-foreground/20'
        }`}
      />
    ))}
  </div>
);

// ─── Slide content ──────────────────────────────────────────────

// The Zenit firefly mascot — layers animated independently (float, wing
// flutter, glow pulse, antennae wiggle, pupils glance). Motion classes live
// in index.css (.zf-*) and respect prefers-reduced-motion.
const FireflyMascot: FC = () => (
  <div
    className="zf-bee absolute left-1/2 top-[63.5%] z-[4] w-[60%] max-w-[236px] -translate-x-1/2 -translate-y-1/2"
    aria-hidden
  >
    <svg viewBox="0 0 272 285" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto overflow-visible">
      {/* wings (behind body) */}
      <g className="zf-wing zf-wing-left">
        <path d="M17.5285 207.408C22.6923 178.557 42.6524 146.763 82.1758 132.51C83.7976 155.27 85.3041 202.964 78.3558 211.662C71.4075 220.36 65.6843 224.349 59.5064 227.844C17.5285 251.595 15.6542 217.879 17.5285 207.408Z" fill="white" />
      </g>
      <g className="zf-wing zf-wing-right">
        <path d="M268.532 187.121C256.302 161.043 220.474 134.386 179.364 130.909C183.61 152.93 194.303 198.595 203.104 205.085C211.905 211.576 231.861 217.255 236.686 216.676C276.059 221.775 272.971 196.586 268.532 187.121Z" fill="white" />
      </g>

      <g>
        {/* antennae (behind head) */}
        <g className="zf-antennae">
          <path d="M107.103 58.6993L109.734 62.5915L101.95 67.8539L99.3189 63.9617L103.211 61.3305L107.103 58.6993ZM94.0651 2.34967C95.3625 0.102598 98.2358 -0.667306 100.483 0.630043C102.73 1.92739 103.5 4.80071 102.202 7.04779L98.1338 4.69873L94.0651 2.34967ZM103.211 61.3305L99.3189 63.9617C95.6029 58.4647 91.0027 49.0161 88.9215 38.0734C86.8339 27.0978 87.2149 14.2146 94.0651 2.34967L98.1338 4.69873L102.202 7.04779C96.8156 16.3781 96.3396 26.7877 98.1522 36.3178C99.9711 45.8807 104.028 54.1504 107.103 58.6993L103.211 61.3305Z" fill="#AE99FF" />
          <path d="M144.806 61.3305C151.598 51.2846 162.121 25.8939 149.884 4.69873" stroke="#AE99FF" strokeWidth="9.39623" strokeLinecap="round" />
        </g>

        {/* abdomen */}
        <path d="M235.703 246.071C232.715 227.844 224.841 213.115 223 205.75L107.56 256.566C147.329 286.945 188.754 285.396 204.772 284.183C233.936 281.974 237.544 257.302 235.703 246.071Z" fill="#FFEE02" />
        <path d="M224.656 205.751C221.121 192.495 214.714 184.026 211.952 181.448L81.6 225.083C84.6931 240.549 102.037 253.621 110.322 258.224C128.438 266.619 157.271 261.722 169.422 258.224C204.33 251.596 220.79 220.48 224.656 205.751Z" fill="#FFF899" />
        <path d="M214.878 184.12C214.552 168.747 193.823 151.622 189.225 151.622L69.7426 158.106C68.1577 158.192 66.7861 159.269 66.3898 160.806C57.9401 193.577 76.1156 220.487 82.1973 228.453C82.557 228.924 83.0311 229.299 83.5707 229.544C138.441 254.456 207.794 218.198 214.81 184.841C214.86 184.602 214.883 184.364 214.878 184.12Z" fill="#FFEE02" />
        <path d="M197.409 156.037C195.127 153.052 192.409 146.398 179.389 129.433C178.682 128.511 177.58 127.969 176.418 127.969L74.3606 127.969C73.0282 127.969 71.7872 128.66 71.1899 129.852C64.3077 143.575 60.9424 171.62 64.2327 185.203C64.384 185.828 64.7292 186.398 65.1868 186.848C120.488 241.314 196.678 187.685 197.854 157.299C197.872 156.835 197.691 156.405 197.409 156.037Z" fill="#724DFF" />

        {/* left hand */}
        <path d="M69.1262 199.094C75.1427 197.028 75.9331 192.326 75.0666 186.67C74.2 181.013 74.5789 181.442 74.5659 178.118C74.5468 173.215 75.8651 168.053 74.7065 163.328C72.2401 156.145 66.317 157.135 61.7519 158.703C61.4348 158.812 61.1266 158.936 60.8272 159.074C56.5328 160.93 52.9576 166.968 52.0042 174.894C51.3505 180.33 52.0561 185.602 53.7194 189.688C53.7351 189.735 53.7506 189.782 53.7668 189.829C56.2331 197.012 63.1098 201.16 69.1262 199.094Z" fill="#AE99FF" />

        {/* head */}
        <circle cx="127.038" cy="106.053" r="57.9958" fill="#5E33FF" />

        {/* eyes (sclera) */}
        <path d="M115.909 64.3518C121.033 84.0045 109.341 104.138 89.6927 109.403C70.0444 114.667 49.8528 103.077 44.4639 83.4956L115.909 64.3518Z" fill="white" />
        <path d="M206.334 83.4956C200.945 103.077 180.754 114.667 161.105 109.403C141.457 104.138 129.766 84.0047 134.89 64.3521L206.334 83.4956Z" fill="white" />

        {/* mouth */}
        <path d="M139.596 100.745C142.844 108.71 139.585 117.594 132.282 120.624C124.98 123.654 116.388 119.688 113.042 111.763L139.596 100.745Z" fill="white" />

        {/* thumbs-up hand */}
        <path d="M188.457 141.84C187.614 145.211 184.593 146.288 183.188 146.405C178.693 144.158 178.623 136.338 179.325 132.709C177.077 131.023 174.174 131.07 173.003 131.304C162.326 137.204 170.661 149.215 176.164 154.483C168.578 154.202 166.213 159.751 165.979 162.561C166.259 166.494 169.842 167.477 171.598 167.477C169.069 169.163 169.004 171.419 169.707 172.473C170.673 174.958 173.94 174.501 175.462 174.15C173.495 177.241 177.163 180.481 179.325 180.481C188.457 181.387 193.741 176.472 197.253 169.916C207.871 150.098 193.374 143.713 188.457 141.84Z" fill="#AE99FF" />

        {/* pupils */}
        <g className="zf-pupils">
          <circle cx="84.7838" cy="90.0357" r="6.07575" fill="#131927" />
          <circle cx="165.703" cy="90.0357" r="6.07575" fill="#131927" />
        </g>

        {/* blush */}
        <path d="M168.188 115.167L175.92 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />
        <path d="M156.865 115.167L164.598 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />
        <path d="M179.511 115.167L187.244 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />
        <path d="M83.1279 115.167L75.3952 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />
        <path d="M94.4502 115.167L86.7174 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />
        <path d="M71.8037 115.167L64.0709 107.434" stroke="#FE6DD2" strokeWidth="2.81887" strokeLinecap="round" />

        {/* teeth */}
        <path d="M119.858 109.091L125.934 121.242" stroke="black" strokeWidth="0.375849" strokeLinecap="round" />
        <path d="M133.114 103.568L138.638 114.339" stroke="black" strokeWidth="0.375849" strokeLinecap="round" />
        <path d="M126.486 106.33L133.391 119.586" stroke="black" strokeWidth="0.375849" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const WelcomeSlide: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => (
  <div className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / TOTAL}%` }}>
    {/* soft purple glow grounding the scene */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(90% 55% at 50% 78%, hsl(265 90% 60% / 0.16) 0%, transparent 60%)' }}
    />

    {/* city skyline — scaled up as a backdrop (overflows the sides, cropped) so
        the buildings read taller behind the firefly */}
    <div className="absolute left-[58%] top-[28%] w-[250%] -translate-x-1/2 opacity-90 pointer-events-none">
      <img src="/onb-city.svg" alt="" className="block w-full h-auto" />
    </div>
    {/* street-grid map */}
    <div className="absolute left-1/2 top-[50%] w-[135%] -translate-x-1/2 opacity-90 pointer-events-none">
      <img src="/onb-map.svg" alt="" className="block w-full h-auto" />
    </div>
    {/* fade the map into the floor near the button */}
    <div
      className="absolute inset-x-0 bottom-0 h-[230px] z-[3] pointer-events-none"
      style={{ background: 'linear-gradient(180deg, hsl(249 42% 12% / 0) 0%, hsl(249 42% 12%) 72%)' }}
    />

    {/* copy */}
    <div className="absolute inset-x-0 top-[92px] z-[5] px-[30px] text-center">
      <h1 className="text-foreground font-bold text-[43px] leading-[1.05] tracking-[-0.5px]">
        Camina con luz<br />propia
      </h1>
      <p className="mt-[22px] mx-auto max-w-[300px] text-muted-foreground font-medium text-[18px] leading-[1.4]">
        {slide.subtitle}
      </p>
    </div>

    {/* firefly glow */}
    <div
      className="zf-glow absolute left-1/2 top-[64%] z-[3] w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,233,2,.42) 0%, rgba(255,191,0,.18) 32%, rgba(255,191,0,0) 62%)', filter: 'blur(6px)' }}
      aria-hidden
    />
    {/* firefly */}
    <FireflyMascot />

    {/* CTA */}
    <button
      onClick={onContinue}
      className="absolute left-6 right-6 bottom-[74px] z-[6] h-[66px] rounded-full bg-accent text-accent-foreground font-bold text-[19px] tracking-[0.2px] transition-transform active:scale-[0.985]"
      style={{ boxShadow: '0 16px 38px -12px rgba(255,230,0,0.55)' }}
    >
      Continuar
    </button>
  </div>
);

const SlideScreen: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => {
  if (slide.id === 'welcome') {
    return <WelcomeSlide slide={slide} onContinue={onContinue} />;
  }

  return (
  <div className="flex flex-col h-full flex-shrink-0" style={{ width: `${100 / TOTAL}%` }}>
    <div className="flex flex-col px-6 pt-28 pb-4 items-center text-center">
      <h1 className="font-extrabold text-foreground mb-4 whitespace-pre-line w-full text-[32px] leading-[43px]">
        {slide.title}
      </h1>
      <p className="text-xl text-muted-foreground leading-[27px] mb-10 max-w-[320px]">
        {slide.subtitle}
      </p>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-full bg-accent text-background font-bold text-base"
      >
        Continuar
      </button>
    </div>

    <div className="flex-1 flex flex-col min-h-0 justify-end">
      {slide.illustration === 'share' ? (
        <div className="flex-1 flex items-start justify-center px-6 overflow-hidden">
          <div className="relative w-full h-full rounded-[26px] overflow-hidden">
            <img src="/amigos.png" alt="Compartir ruta" className="w-full h-full object-cover object-top" />
            <div
              className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.98) 8%, rgba(15, 23, 42, 0.92) 18%, rgba(15, 23, 42, 0.72) 32%, rgba(15, 23, 42, 0.4) 52%, rgba(15, 23, 42, 0.1) 72%, rgba(15, 23, 42, 0) 100%)' }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex items-center overflow-hidden">
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={slide.illustration === 'route' ? '/SAFE.png' : '/SHARED.png'}
              alt={slide.illustration === 'route' ? 'Ruta segura' : 'Ruta de amigos'}
              className="w-full h-full object-cover object-center"
              style={{ transform: 'scale(1.3)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(249 42% 12%) 0%, transparent 40%)' }} />
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

const INPUT_CLS = "w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

// ─── Location permission modal ──────────────────────────────────

const LocationModal: FC<{ onAllow: () => void; onSkip: () => void }> = ({ onAllow, onSkip }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center">
    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onSkip} />
    <div className="relative w-full max-w-md bg-card rounded-t-3xl px-6 pt-8 pb-10 flex flex-col items-center text-center animate-slide-up">
      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Acceso a tu ubicación</h2>
      <p className="text-[18px] text-muted-foreground leading-relaxed mb-8 w-full">
        Zenit necesita tu ubicación para mostrarte rutas seguras y que tus amigos puedan seguirte en tiempo real.
      </p>
      <button
        onClick={onAllow}
        className="w-full py-4 rounded-full bg-accent text-background font-bold text-base mb-3"
      >
        Permitir ubicación
      </button>
      <button
        onClick={onSkip}
        className="w-full py-3 rounded-full text-muted-foreground text-sm font-medium"
      >
        Ahora no
      </button>
    </div>
  </div>
);

// ─── Register screen ────────────────────────────────────────────

const RegisterScreen: FC<{ onBack: () => void; onSuccess: () => void; onDemoLogin: () => void; demoLoading: boolean }> = ({ onBack, onSuccess, onDemoLogin, demoLoading }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await signUp(email.trim(), password.trim(), name.trim(), username.trim());
    setLoading(false);
    if (err) {
      const msg = err.includes('schema cache') || err.includes('profiles')
        ? 'La base de datos no está configurada aún. Ejecuta la migración SQL en Supabase.'
        : err.includes('already registered')
        ? 'Este email ya tiene cuenta. Inicia sesión.'
        : err;
      setError(msg);
      return;
    }
    onSuccess();
  };

  return (
    <div className="flex flex-col h-full flex-shrink-0 px-6 pt-16 pb-10 overflow-y-auto" style={{ width: `${100 / TOTAL}%` }}>
      <button onClick={onBack} className="self-start mb-6 text-muted-foreground flex items-center gap-1 text-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Volver
      </button>

      <h1 className="text-[32px] font-extrabold text-foreground mb-2 leading-[43px] w-full text-center">Crea tu cuenta</h1>
      <p className="text-xl text-muted-foreground mb-7 leading-[27px] text-center">
        Únete a Zenit y comparte tus rutas con tu círculo de confianza.
      </p>

      <div className="space-y-3 mb-6">
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} className={INPUT_CLS} />
        <input type="text" placeholder="Nombre de usuario (ej. @laura)" value={username} onChange={e => setUsername(e.target.value)} className={INPUT_CLS} />
        <input type="tel" placeholder="Número de teléfono" value={phone} onChange={e => setPhone(e.target.value)} className={INPUT_CLS} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_CLS} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_CLS} />
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4 text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || !email.trim() || !password.trim() || loading}
        className="w-full py-4 rounded-full bg-accent text-background font-bold text-base mb-4 disabled:opacity-50"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-muted-foreground mb-6">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onBack} className="text-foreground underline">Inicia sesión</button>
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">o regístrate con</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-3">
        <button onClick={onDemoLogin} disabled={demoLoading} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium disabled:opacity-50">
          {demoLoading ? '…' : <><GoogleIcon /> Google</>}
        </button>
        <button onClick={onDemoLogin} disabled={demoLoading} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium disabled:opacity-50">
          {demoLoading ? '…' : <><AppleIcon /> Apple</>}
        </button>
      </div>
    </div>
  );
};

// ─── Login screen ───────────────────────────────────────────────

const LoginScreen: FC<{ onDemoLogin: () => void; onRegister: () => void; demoLoading?: boolean }> = ({ onDemoLogin, onRegister, demoLoading }) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email.trim(), password.trim());
    setLoading(false);
    if (err) { setError('Email o contraseña incorrectos'); return; }
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col h-full flex-shrink-0 px-6 pt-20 pb-10" style={{ width: `${100 / TOTAL}%` }}>
      <h1 className="text-[32px] font-extrabold text-foreground mb-2 leading-[43px] w-full text-center">Mantente conectado</h1>
      <p className="text-xl text-muted-foreground mb-8 leading-[27px] text-center">
        Crea una cuenta o inicia sesión para compartir tus rutas y mantenerte conectado con tu círculo.
      </p>

      <div className="space-y-3 mb-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_CLS} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_CLS} />
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4 text-center">{error}</p>
      )}

      <button
        onClick={handleLogin}
        disabled={!email.trim() || !password.trim() || loading}
        className="w-full py-4 rounded-full bg-accent text-background font-bold text-base mb-4 disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-sm text-muted-foreground mb-6">
        No tienes una cuenta?{' '}
        <button onClick={onRegister} className="text-foreground underline">Regístrate</button>
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-3">
        <button onClick={onDemoLogin} disabled={demoLoading} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium disabled:opacity-50">
          {demoLoading ? '…' : <><GoogleIcon /> Google</>}
        </button>
        <button onClick={onDemoLogin} disabled={demoLoading} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium disabled:opacity-50">
          {demoLoading ? '…' : <><AppleIcon /> Apple</>}
        </button>
      </div>
    </div>
  );
};

// ─── Main onboarding ────────────────────────────────────────────

const Onboarding: FC = () => {
  const navigate = useNavigate();
  const { signInAsDemo } = useAuth();
  const [step, setStep] = useState(0);
  const [subScreen, setSubScreen] = useState<'login' | 'register' | 'location'>('login');
  const [demoLoading, setDemoLoading] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const goTo = useCallback((nextStep: number) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, nextStep));
    setIsAnimating(true);
    setDragOffset(0);
    setStep(clamped);
    setSubScreen('login');
    setTimeout(() => setIsAnimating(false), 400);
  }, []);

  // Demo path — authenticates as Patricia via Supabase, then shows location modal
  const handleDemoLogin = async () => {
    setDemoLoading(true);
    await signInAsDemo();
    setDemoLoading(false);
    setSubScreen('location');
  };

  const handleRequestLocation = () => {
    setSubScreen('location');
  };

  const handleAllowLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }
    localStorage.setItem('zenit_onboarded', 'true');
    navigate('/', { replace: true });
  };

  const handleSkipLocation = () => {
    localStorage.setItem('zenit_onboarded', 'true');
    navigate('/', { replace: true });
  };

  // ── Touch events ──
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Resist at edges
    const atStart = step === 0 && delta > 0;
    const atEnd = step === TOTAL - 1 && delta < 0;
    if (atStart || atEnd) {
      setDragOffset(delta * 0.2);
    } else {
      setDragOffset(delta);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset < -SWIPE_THRESHOLD) {
      goTo(step + 1);
    } else if (dragOffset > SWIPE_THRESHOLD) {
      goTo(step - 1);
    } else {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 300);
    }
    touchStartX.current = null;
  };

  // ── Mouse events (desktop) ──
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const delta = e.clientX - touchStartX.current;
    const atStart = step === 0 && delta > 0;
    const atEnd = step === TOTAL - 1 && delta < 0;
    setDragOffset((atStart || atEnd) ? delta * 0.2 : delta);
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset < -SWIPE_THRESHOLD) {
      goTo(step + 1);
    } else if (dragOffset > SWIPE_THRESHOLD) {
      goTo(step - 1);
    } else {
      setIsAnimating(true);
      setDragOffset(0);
      setTimeout(() => setIsAnimating(false), 300);
    }
    touchStartX.current = null;
  };

  const translateX = `calc(${-step * (100 / TOTAL)}% + ${dragOffset}px)`;

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden select-none">
      {/* Skip button — only on slides, not login */}
      {step < SLIDES.length && (
        <button
          onClick={() => goTo(SLIDES.length)}
          className="absolute top-12 right-4 z-20 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm text-sm text-muted-foreground"
        >
          saltar
        </button>
      )}

      {/* Carousel strip */}
      <div
        className="flex h-full touch-pan-y"
        style={{
          width: `${TOTAL * 100}%`,
          transform: `translateX(${translateX})`,
          transition: isAnimating || dragOffset === 0 ? 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          willChange: 'transform',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {SLIDES.map((slide) => (
          <SlideScreen
            key={slide.id}
            slide={slide}
            onContinue={() => goTo(step + 1)}
          />
        ))}
        {subScreen === 'register' ? (
          <RegisterScreen
            onBack={() => setSubScreen('login')}
            onSuccess={handleRequestLocation}
            onDemoLogin={handleDemoLogin}
            demoLoading={demoLoading}
          />
        ) : (
          <LoginScreen onDemoLogin={handleDemoLogin} onRegister={() => setSubScreen('register')} demoLoading={demoLoading} />
        )}
      </div>

      {/* Location permission modal */}
      {subScreen === 'location' && (
        <LocationModal onAllow={handleAllowLocation} onSkip={handleSkipLocation} />
      )}

      {/* Dots — fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center z-10">
        <Dots total={TOTAL} current={step} />
      </div>
    </div>
  );
};

export default Onboarding;
