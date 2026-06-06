import { FC, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Con Zenit\nno vas a ciegas',
    subtitle: 'Planifica rutas seguras y comparte tu trayecto en tiempo real.',
    illustration: 'city',
  },
  {
    id: 'safe-route',
    title: 'La ruta\nmás segura',
    subtitle: 'Elige tu destino y avanza con seguridad por calles anchas, iluminadas y más transitadas',
    illustration: 'route',
  },
  {
    id: 'friends-route',
    title: 'Tu red de\nluciérnagas',
    subtitle: 'Agrega a amigos y comparte tu ruta para que puedan acompañarte a casa.',
    illustration: 'friends',
  },
  {
    id: 'follow-light',
    title: 'Sigue su luz',
    subtitle: 'Mira también el recorrido de tus amigos en tiempo real en tu mapa.',
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
    <div className="absolute inset-x-0 top-[92px] z-[5] px-[22px] text-center">
      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px]">
        <span>Con </span>
        <img
          src="/logo.png"
          alt="Zenit"
          className="inline-block h-[1.05em] align-bottom mx-1"
          style={{ transform: 'translateY(-10px)' }}
        />
        <span className="block">no vas a ciegas</span>
      </h1>
      <p className="mt-[22px] mx-auto max-w-[345px] text-muted-foreground font-medium text-[23px] leading-[1.4]">
        Planifica <b className="font-bold text-[#cfc7ea]">rutas seguras</b> y <b className="font-bold text-[#cfc7ea]">comparte tu trayecto</b> en tiempo real.
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

// Screen 2's sleepy firefly — eyes stay still, the two eye-sparkles scale up/down
// in sync (each around its own centre). Motion classes live in index.css (.ff-*).
// Renders centred (+ its glow) inside the nearest positioned ancestor.
const FireflyMascotTwo: FC = () => (
  <>
    <div
      className="ff-glow absolute left-[64%] top-[53%] z-[4] w-[64%] max-w-[248px] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 56%, rgba(255,233,2,.34) 0%, rgba(255,191,0,.15) 34%, rgba(255,191,0,0) 64%)', filter: 'blur(6px)' }}
      aria-hidden
    />
    <div
      className="ff-bee absolute left-[64%] top-[52%] z-[5] w-[48%] max-w-[184px] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <svg viewBox="0 0 185 221" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto overflow-visible">
      {/* antennae */}
      <g className="ff-antennae">
        <path d="M67.5238 47.6525L65.6757 50.6248L71.6204 54.3209L73.4684 51.3485L70.4961 49.5005L67.5238 47.6525ZM77.3803 1.85906C76.4738 0.151822 74.3549 -0.497279 72.6477 0.409255C70.9404 1.31579 70.2913 3.43467 71.1979 5.14191L74.2891 3.50049L77.3803 1.85906ZM70.4961 49.5005L73.4684 51.3485C76.2228 46.9184 79.6309 39.3033 81.1709 30.4996C82.7132 21.6829 82.4297 11.3684 77.3803 1.85906L74.2891 3.50049L71.1979 5.14191C75.2901 12.8487 75.6469 21.4542 74.2756 29.2935C72.902 37.1458 69.8427 43.9226 67.5238 47.6525L70.4961 49.5005Z" fill="#AE99FF" />
        <path d="M108.524 51.3485L110.372 54.3209L116.316 50.6248L114.468 47.6525L111.496 49.5005L108.524 51.3485ZM110.794 5.14191C111.701 3.43467 111.052 1.31579 109.345 0.409255C107.637 -0.497279 105.518 0.151823 104.612 1.85906L107.703 3.50049L110.794 5.14191ZM111.496 49.5005L114.468 47.6525C112.149 43.9226 109.09 37.1458 107.717 29.2935C106.345 21.4542 106.702 12.8487 110.794 5.14191L107.703 3.50049L104.612 1.85906C99.5625 11.3684 99.279 21.6829 100.821 30.4996C102.361 39.3033 105.769 46.9184 108.524 51.3485L111.496 49.5005Z" fill="#AE99FF" />
      </g>

      {/* wings */}
      <path className="ff-wing ff-wing-left" d="M4.62743 108.713C19.8111 93.5294 45.544 95.6482 56.5125 98.6056L40.4528 144.538C9.09714 136.137 3.50436 117.154 4.62743 108.713Z" fill="white" stroke="white" strokeWidth="8.98443" strokeLinecap="round" />
      <path className="ff-wing ff-wing-right" d="M179.917 108.713C164.734 93.5294 139.001 95.6482 128.032 98.6056L144.092 144.538C175.448 136.137 181.041 117.154 179.917 108.713Z" fill="white" stroke="white" strokeWidth="8.98443" strokeLinecap="round" />

      {/* abdomen */}
      <path d="M137.365 175.114L136.06 180.64C133.663 190.778 122.777 212.295 97.8105 218.984L92.1572 220.499V220.5L86.5029 218.984C61.5364 212.294 50.6502 190.778 48.2539 180.64L46.9482 175.114H137.365Z" fill="#FFEE02" />
      <path d="M137.943 143.404L139.274 145.422C142.391 150.147 146.229 161.954 139.484 174.536L139.275 174.924L138.995 175.265C136.633 178.138 131.709 181.55 124.378 184.24C117.284 186.843 107.671 188.871 95.268 189.064V189.081H88.8364V189.064C76.4338 188.871 66.8206 186.843 59.726 184.24C52.395 181.55 47.4719 178.138 45.1098 175.265L44.8295 174.924L44.6206 174.536C37.8756 161.954 41.713 150.147 44.8305 145.422L46.1616 143.404H137.943Z" fill="#FFF899" />
      <path d="M141.88 126.149L143.216 128.126C146.57 133.088 150.734 145.566 143.431 158.859L143.217 159.25L142.93 159.591C140.411 162.582 135.12 166.172 127.187 169.013C119.443 171.786 108.904 173.947 95.2615 174.115V174.128H89.0555V174.115C75.413 173.947 64.8737 171.786 57.1297 169.013C49.1965 166.172 43.906 162.582 41.3865 159.591L41.1004 159.25L40.8856 158.859C33.5832 145.566 37.747 133.088 41.1014 128.126L42.4373 126.149H141.88Z" fill="#FFEE02" />
      <path d="M129.78 96.5005C131.052 96.5007 132.199 97.0301 133.016 97.8794C133.2 98.0233 133.376 98.1836 133.54 98.3599C137.909 103.053 146.227 115.906 145.461 131.24L145.383 132.809L144.343 133.988C138.957 140.091 121.843 150.027 92.3552 150.088C92.3351 150.089 92.3148 150.09 92.2947 150.09C92.2587 150.09 92.2222 150.089 92.1863 150.089C92.1509 150.089 92.1153 150.09 92.0798 150.09C92.059 150.09 92.038 150.089 92.0173 150.088C62.5306 150.026 45.4175 140.091 40.032 133.988L38.9919 132.809L38.9138 131.24C38.1472 115.905 46.4652 103.053 50.8347 98.3599C51.3006 97.8595 51.8537 97.4888 52.449 97.2505C53.161 96.7763 54.0167 96.5005 54.9363 96.5005H129.78Z" fill="#724DFF" />

      {/* head */}
      <circle cx="91.8895" cy="82.0814" r="42.5672" fill="#5E33FF" />

      {/* nose / mouth */}
      <path d="M92.499 108.448C101.607 108.448 104.482 90.9022 104.743 89.1788C104.756 89.0906 104.709 89.018 104.628 88.9797C103.826 88.5984 99.625 86.555 97.4237 84.544C95.3576 82.6565 93.2603 79.16 92.6654 78.1315C92.5888 77.9992 92.3989 77.992 92.3138 78.1188C91.6383 79.1256 89.2329 82.6122 87.0642 84.544C84.9407 86.4355 81.0919 88.5753 80.3582 88.9763C80.2839 89.017 80.2415 89.0858 80.2542 89.1696C80.5056 90.8387 83.3747 108.448 92.499 108.448Z" fill="#FE6DD2" stroke="#FE6DD2" strokeWidth="4.05403" strokeLinecap="round" />
      <path d="M103.849 99.8329C97.9213 89.5665 84.8926 91.2776 79.1191 93.3465C82.261 107.84 89.3136 110.948 92.8399 110.576C99.3571 110.576 103.241 101.657 103.849 99.8329Z" fill="#E4029F" stroke="#E4029F" strokeWidth="0.202701" />

      {/* eyes (static) */}
      <path d="M84.9353 51.2744C88.6957 65.6986 80.1151 80.4758 65.6942 84.3401C51.273 88.2042 36.4526 79.6972 32.4971 65.3252L84.9353 51.2744Z" fill="white" />
      <path d="M70.6299 55.106C72.3961 61.6975 68.4849 68.4729 61.8935 70.2392C55.3019 72.0055 48.5262 68.0936 46.76 61.5019L46.7598 61.501L70.6296 55.1051L70.6299 55.106Z" fill="#131927" />
      <path d="M151.309 65.3211C147.355 79.6942 132.533 88.202 118.112 84.3378C103.69 80.4735 95.1084 65.695 98.8701 51.27L151.309 65.3211Z" fill="white" />
      <path d="M137.001 61.4875C135.234 68.079 128.459 71.9909 121.867 70.2248C115.276 68.4586 111.364 61.6829 113.13 55.0913L137.001 61.4875Z" fill="#131927" />

      {/* sparkles — each scales in place around its own centre, in sync */}
      <g className="ff-sparkle">
        <path d="M124.412 53.8335C124.545 57.2263 127.265 59.946 130.656 60.0776C127.263 60.2107 124.544 62.9304 124.412 66.3217C124.279 62.9289 121.559 60.2091 118.168 60.0776C121.561 59.9445 124.281 57.2248 124.412 53.8335Z" fill="white" />
        <path d="M125.179 53.8335C124.669 53.8335 124.159 53.8335 123.649 53.8335C123.86 57.653 126.838 60.6328 130.658 60.8424V59.3127C126.838 59.5238 123.859 62.5021 123.649 66.3216H125.179C124.968 62.5021 121.989 59.5223 118.17 59.3127V60.8424C121.989 60.6313 124.969 57.653 125.179 53.8335C125.234 52.8499 123.703 52.853 123.649 53.8335C123.485 56.7918 121.127 59.1506 118.17 59.3127C117.186 59.3678 117.185 60.7873 118.17 60.8424C121.128 61.0061 123.487 63.3648 123.649 66.3216C123.704 67.3052 125.124 67.3067 125.179 66.3216C125.342 63.3633 127.701 61.0045 130.658 60.8424C131.642 60.7873 131.643 59.3678 130.658 59.3127C127.7 59.149 125.341 56.7903 125.179 53.8335C125.125 52.853 123.687 52.8453 123.649 53.8335C123.611 54.8186 125.141 54.8155 125.179 53.8335Z" fill="white" />
      </g>
      <g className="ff-sparkle">
        <path d="M59.3466 53.8335C59.4797 57.2263 62.1994 59.946 65.5907 60.0776C62.1979 60.2107 59.4782 62.9304 59.3466 66.3217C59.2135 62.9289 56.4938 60.2091 53.1025 60.0776C56.4953 59.9445 59.2151 57.2248 59.3466 53.8335Z" fill="white" />
        <path d="M60.1095 53.8335C59.6001 53.8335 59.0892 53.8335 58.5798 53.8335C58.7909 57.653 61.7692 60.6328 65.5887 60.8424V59.3127C61.7692 59.5238 58.7894 62.5021 58.5798 66.3216H60.1095C59.8984 62.5021 56.9201 59.5223 53.1006 59.3127V60.8424C56.9201 60.6313 59.8999 57.653 60.1095 53.8335C60.1645 52.8499 58.6333 52.853 58.5798 53.8335C58.4161 56.7918 56.0574 59.1506 53.1006 59.3127C52.117 59.3678 52.1155 60.7873 53.1006 60.8424C56.0589 61.0061 58.4177 63.3648 58.5798 66.3216C58.6349 67.3052 60.0544 67.3067 60.1095 66.3216C60.2731 63.3633 62.6319 61.0045 65.5887 60.8424C66.5723 60.7873 66.5738 59.3678 65.5887 59.3127C62.6304 59.149 60.2716 56.7903 60.1095 53.8335C60.0559 52.853 58.6181 52.8453 58.5798 53.8335C58.5416 54.8186 60.0712 54.8155 60.1095 53.8335Z" fill="white" />
      </g>

      {/* hands */}
      <path d="M59.8851 100.325C65.1434 100.325 67.0237 103.234 67.8646 107.142C68.7056 111.05 69.7688 112.868 69.7688 112.868C69.7688 112.868 73.4866 117.412 73.8493 120.775C73.8493 126.046 68.9527 128.501 64.963 128.501C64.6858 128.501 64.4115 128.489 64.1403 128.465C60.2847 128.215 55.8688 125.058 52.9955 120.069C51.0252 116.649 50.1615 113.029 50.365 109.972C50.3646 109.938 50.3641 109.903 50.3641 109.868C50.3641 104.598 54.6268 100.325 59.8851 100.325Z" fill="#AE99FF" />
      <path d="M123.895 100.325C118.637 100.325 116.757 103.234 115.916 107.142C115.075 111.05 114.011 112.868 114.011 112.868C114.011 112.868 110.294 117.412 109.931 120.775C109.931 126.046 114.828 128.501 118.817 128.501C119.094 128.501 119.369 128.489 119.64 128.465C123.496 128.215 127.911 125.058 130.785 120.069C132.755 116.649 133.619 113.029 133.415 109.972C133.416 109.938 133.416 109.903 133.416 109.868C133.416 104.598 129.153 100.325 123.895 100.325Z" fill="#AE99FF" />
    </svg>
    </div>
  </>
);

const SafeRouteSlide: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => (
  <div className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / TOTAL}%` }}>
    {/* map area — previous SAFE.png map illustration as background */}
    <div className="absolute inset-x-0 top-[30%] bottom-0 overflow-hidden pointer-events-none">
      <img src="/SAFE.png" alt="" className="w-full h-full object-cover object-center" style={{ transform: 'scale(1.3)' }} />
      {/* fade the map's top edge into the background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(249 42% 12%) 0%, transparent 35%)' }} />
    </div>

    {/* fade the map into the floor near the button */}
    <div
      className="absolute inset-x-0 bottom-0 h-[240px] z-[4] pointer-events-none"
      style={{ background: 'linear-gradient(180deg, hsl(249 42% 12% / 0) 0%, hsl(249 42% 12%) 78%)' }}
    />

    {/* copy — current title kept, screenshot subtitle added */}
    <div className="absolute inset-x-0 top-[96px] z-[6] px-[22px] text-center">
      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px] whitespace-pre-line">
        {slide.title}
      </h1>
      <p className="mt-5 mx-auto max-w-[345px] text-muted-foreground font-medium text-[20px] leading-[1.45]">
        Elige tu destino y avanza con seguridad por calles{' '}
        <b className="font-bold text-[#cfc7ea]">anchas, iluminadas</b> y más{' '}
        <b className="font-bold text-[#cfc7ea]">transitadas</b>.
      </p>
    </div>

    {/* firefly (glow + sleepy mascot, centred at ~52%) */}
    <FireflyMascotTwo />

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

// Screen 3 — "Tu red de luciérnagas". A central avatar (you) linked by an X of
// lines to four friends in the corners. The network is static (no floating);
// motion lives in index.css (.zn-*): sonar rings radiate from the centre, gold
// sparks travel out along each line to a friend, each friend emits an expansive
// wave as the spark arrives, and the friend avatars pulse a soft gold halo.
const FRIENDS = [
  { key: 'tl', src: '/red-1.png', cls: 'a-tl', pos: 'left-[8%] top-[8%]' },
  { key: 'tr', src: '/red-2.png', cls: 'a-tr', pos: 'left-[92%] top-[8%]' },
  { key: 'bl', src: '/red-3.png', cls: 'a-bl', pos: 'left-[8%] top-[92%]' },
  { key: 'br', src: '/red-4.png', cls: 'a-br', pos: 'left-[92%] top-[92%]' },
] as const;

const FireflyNetwork: FC = () => (
  <div className="absolute left-1/2 top-[58%] z-[4] w-[324px] h-[324px] -translate-x-1/2 -translate-y-1/2">
    <svg viewBox="0 0 308 308" fill="none" className="absolute inset-0 w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
      {/* connecting lines (X through the centre) — reach out to the pushed-out friends */}
      <line x1="47.41" y1="47.41" x2="260.59" y2="260.59" stroke="hsl(249 18% 78%)" strokeWidth="5" />
      <line x1="260.59" y1="47.41" x2="47.41" y2="260.59" stroke="hsl(249 18% 78%)" strokeWidth="5" />
      {/* sonar pulses from the centre */}
      <circle className="zn-sonar" cx="154" cy="154" r="66" />
      <circle className="zn-sonar zn-sonar-2" cx="154" cy="154" r="66" />
      {/* centre concentric rings */}
      <circle cx="154" cy="154" r="93.02" fill="none" stroke="hsl(54 100% 79%)" strokeWidth="4" />
      <circle cx="153.53" cy="154.47" r="128.56" fill="none" stroke="hsl(56 100% 51%)" strokeWidth="5" />
      {/* corner halo rings */}
      <circle cx="24.64" cy="24.64" r="32.20" fill="none" stroke="hsl(54 100% 79%)" strokeWidth="3" />
      <circle cx="283.36" cy="24.64" r="32.20" fill="none" stroke="hsl(54 100% 79%)" strokeWidth="3" />
      <circle cx="24.64" cy="283.36" r="32.20" fill="none" stroke="hsl(54 100% 79%)" strokeWidth="3" />
      <circle cx="283.36" cy="283.36" r="32.20" fill="none" stroke="hsl(54 100% 79%)" strokeWidth="3" />
    </svg>

    {/* travelling light sparks */}
    <span className="zn-spark zn-spark-tl" />
    <span className="zn-spark zn-spark-tr" />
    <span className="zn-spark zn-spark-bl" />
    <span className="zn-spark zn-spark-br" />

    {/* expansive waves from each friend on arrival */}
    <span className="zn-wave zn-wave-tl" />
    <span className="zn-wave zn-wave-tr" />
    <span className="zn-wave zn-wave-bl" />
    <span className="zn-wave zn-wave-br" />

    {/* centre avatar — you */}
    <div className="absolute left-1/2 top-1/2 w-[144px] h-[144px] -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-[3px] border-accent bg-card shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)]">
      <img src="/red-centro.png" alt="Tú" className="w-full h-full object-cover" />
    </div>

    {/* friend avatars */}
    {FRIENDS.map((f) => (
      <div
        key={f.key}
        className={`zn-friend zn-friend-${f.key} absolute ${f.pos} w-[52px] h-[52px] -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-[3px] border-accent bg-card`}
      >
        <img src={f.src} alt="" className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
);

const FriendsNetworkSlide: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => (
  <div className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / TOTAL}%` }}>
    {/* soft gold glow grounding the network */}
    <div
      className="absolute left-1/2 top-[58%] w-[360px] h-[360px] -translate-x-1/2 -translate-y-1/2 z-[2] pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,230,0,.10) 0%, rgba(255,191,0,0) 62%)', filter: 'blur(6px)' }}
      aria-hidden
    />

    {/* copy */}
    <div className="absolute inset-x-0 top-[96px] z-[5] px-[22px] text-center">
      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px] whitespace-pre-line">
        {slide.title}
      </h1>
      <p className="mt-5 mx-auto max-w-[345px] text-muted-foreground font-medium text-[20px] leading-[1.45]">
        Agrega a amigos y <b className="font-bold text-[#cfc7ea]">comparte tu ruta</b> para que puedan acompañarte a casa.
      </p>
    </div>

    {/* firefly network */}
    <FireflyNetwork />

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

// Screen 4 — "Sigue su luz". An awake firefly hovers over a tilted street-grid
// map with two friends pinned as gold-ringed avatars sitting on translucent
// light-cones (live-tracking beams) planted on the map. Motion lives in
// index.css (.sl-*): the firefly floats / flutters / wiggles, the cones flicker,
// and each avatar's gold ring pulses — nothing bobs vertically.

// The awake firefly mascot used on this screen (simpler 140×147 variant).
const FireflyAwake: FC = () => (
  <svg viewBox="0 0 140 147" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto overflow-visible">
    <path className="sl-wing sl-wing-left" d="M9.05352 106.202C11.7206 91.3005 22.0301 74.8788 42.4441 67.5173C43.2818 79.2728 44.0599 103.907 40.4711 108.399C36.8822 112.892 33.9261 114.952 30.7353 116.758C9.05352 129.025 8.08545 111.611 9.05352 106.202Z" fill="white" />
    <path className="sl-wing sl-wing-right" d="M138.698 95.7232C132.381 82.2539 113.876 68.4854 92.6425 66.6895C94.8357 78.0635 100.358 101.65 104.904 105.002C109.45 108.354 119.757 111.288 122.25 110.988C142.586 113.622 140.991 100.612 138.698 95.7232Z" fill="white" />
    <g className="sl-antennae">
      <path d="M49.4826 30.1004C44.6858 26.8279 35.6453 18.2194 37.8572 9.96458C40.622 -0.353915 53.3659 0.384374 58.897 9.96458" stroke="#AE99FF" strokeWidth="5" strokeLinecap="round" />
      <path d="M78.8807 30.1004C83.6774 26.8279 92.718 18.2194 90.5061 9.96458C87.7413 -0.353915 74.9974 0.384374 69.4663 9.96458" stroke="#AE99FF" strokeWidth="5" strokeLinecap="round" />
    </g>
    <path d="M121.742 126.172C120.198 116.757 116.131 109.15 115.18 105.346L55.5553 131.592C76.0959 147.283 97.4923 146.483 105.766 145.856C120.829 144.715 122.693 131.972 121.742 126.172Z" fill="#FFEE02" />
    <path d="M116.036 105.346C114.21 98.4992 110.901 94.1248 109.475 92.7935L42.1471 115.331C43.7447 123.319 52.7027 130.071 56.982 132.448C66.3393 136.785 81.2313 134.255 87.5075 132.448C105.538 129.025 114.039 112.954 116.036 105.346Z" fill="#FFF899" />
    <path d="M110.979 93.9688C110.633 86.0823 100.09 77.3882 97.7354 77.3882L37.5008 80.6573C35.7955 80.7499 34.3086 81.9041 33.9501 83.5739C30.5661 99.3366 38.858 112.247 42.1533 116.671C42.5341 117.183 43.0431 117.585 43.6266 117.842C71.7838 130.251 107.072 111.825 110.907 94.7446C110.964 94.4884 110.99 94.2312 110.979 93.9688Z" fill="#FFEE02" />
    <path d="M101.728 79.3412C100.617 77.7125 99.0522 74.3566 93.2809 66.7473C92.5255 65.7513 91.3404 65.1712 90.0904 65.1712L39.6111 65.1712C38.1774 65.1712 36.8313 65.9218 36.2609 67.2371C33.1369 74.4413 31.6394 87.3667 33.057 94.1988C33.1974 94.8755 33.5701 95.491 34.0678 95.9705C62.3551 123.224 100.927 96.4051 102.169 80.7203C102.208 80.2224 102.009 79.7539 101.728 79.3412Z" fill="#724DFF" />
    <circle cx="64.1894" cy="54.2797" r="29.955" fill="#5E33FF" />
    <path d="M59.2989 32.5964C61.9452 42.747 55.9065 53.1453 45.7582 55.8646C35.6099 58.5836 25.1819 52.5976 22.3984 42.4839L59.2989 32.5964Z" fill="white" />
    <path d="M106.002 42.4866C103.218 52.6003 92.7896 58.5862 82.6413 55.867C72.4932 53.1476 66.4554 42.7495 69.1016 32.5991L106.002 42.4866Z" fill="white" />
    <path d="M73.3824 54.4233C73.8633 54.4233 74.2883 54.7624 74.3106 55.2428C74.3144 55.3253 74.3164 55.4083 74.3164 55.4917L74.3096 55.7671C74.1664 58.5934 71.8286 60.8411 68.9668 60.8413L68.6924 60.8345C67.4303 60.7706 66.2838 60.2688 65.4012 59.4783C64.783 58.9246 63.5939 58.9245 62.9757 59.4783C62.0298 60.3256 60.7809 60.8411 59.4111 60.8413L59.1367 60.8345C56.3103 60.6914 54.0626 58.3536 54.0625 55.4917C54.0625 55.4083 54.0644 55.3254 54.0682 55.2429C54.09 54.7625 54.5146 54.4233 54.9955 54.4233H56.2475C56.7532 54.4233 57.0958 54.986 57.0957 55.4917C57.0958 56.7706 58.1323 57.8078 59.4111 57.8081C60.6899 57.8077 61.7274 56.7705 61.7275 55.4917C61.7274 54.986 62.0693 54.4233 62.575 54.4233H65.8032C66.3089 54.4233 66.6515 54.986 66.6514 55.4917C66.6515 56.7706 67.688 57.8078 68.9668 57.8081C70.2457 57.8079 71.2831 56.7706 71.2832 55.4917C71.2831 54.9859 71.6249 54.4233 72.1307 54.4233H73.3824Z" fill="#FE6DD2" />
    <circle cx="46.1442" cy="77.8874" r="7.91668" fill="#AE99FF" />
    <circle cx="82.2331" cy="77.8874" r="7.91668" fill="#AE99FF" />
    <circle cx="90" cy="49.5" r="5" fill="#131927" />
    <circle cx="46" cy="48.5" r="5" fill="#131927" />
  </svg>
);

// A friend's light-cone beam (translucent gold spotlight planted on the map).
const LightCone: FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 141 243" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="block w-full h-full overflow-visible">
    <ellipse cx="70.5" cy="227.5" rx="27.5" ry="15.5" fill={`url(#${id}-pool)`} fillOpacity="0.5" />
    <path d="M83.2997 226.158C83.2997 226.158 78.3656 229 69.7849 229C61.2043 229 57.7003 226.158 57.7003 226.158L4 94H137L83.2997 226.158Z" fill={`url(#${id}-beam)`} fillOpacity="0.5" />
    <defs>
      <radialGradient id={`${id}-pool`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(70.5 227.5) rotate(90) scale(15.5 27.5)">
        <stop offset="0.23" stopColor="#FFEE02" /><stop offset="1" stopColor="#FFF899" />
      </radialGradient>
      <linearGradient id={`${id}-beam`} x1="70.5" y1="94" x2="70.5" y2="226.158" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFEE02" /><stop offset="1" stopColor="#FFF899" />
      </linearGradient>
    </defs>
  </svg>
);

// One friend marker — avatar circle (z2) with the cone tucked behind it (z0).
const FriendMarker: FC<{ id: string; src: string; pos: string; size: number; bob: string }> = ({ id, src, pos, size, bob }) => (
  <div className={`absolute ${pos} z-[5]`} style={{ width: size }}>
    {/* cone stretched taller (preserveAspectRatio:none) so the beam is long without
        widening its top — the wide top edge tucks just under the ring (corners hidden) */}
    <div className="sl-cone absolute left-1/2 -translate-x-1/2 z-0" style={{ top: size * -0.14, width: size * 0.96, height: size * 2.05 }}>
      <LightCone id={id} />
    </div>
    <div
      className="sl-av relative z-[2] rounded-full overflow-hidden border-[6px] border-accent bg-card"
      style={{ width: size, height: size, ['--bob' as string]: bob }}
    >
      <img src={src} alt="" className="w-full h-full object-cover" />
    </div>
  </div>
);

const FollowLightSlide: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => (
  <div className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / TOTAL}%` }}>
    {/* street-grid map — same treatment as screen 1, nudged up a touch */}
    <div className="absolute left-1/2 top-[calc(50%-40px)] w-[135%] -translate-x-1/2 opacity-90 pointer-events-none">
      <img src="/onb-map.svg" alt="" className="block w-full h-auto" />
    </div>
    {/* fade the map into the floor near the button */}
    <div
      className="absolute inset-x-0 bottom-0 h-[230px] z-[4] pointer-events-none"
      style={{ background: 'linear-gradient(180deg, hsl(249 42% 12% / 0) 0%, hsl(249 42% 12%) 72%)' }}
    />

    {/* copy */}
    <div className="absolute inset-x-0 top-[96px] z-[5] px-[22px] text-center">
      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px]">
        {slide.title}
      </h1>
      <p className="mt-[18px] mx-auto max-w-[345px] text-muted-foreground font-medium text-[20px] leading-[1.45]">
        Mira también el <b className="font-bold text-[#cfc7ea]">recorrido de tus amigos</b> en tiempo real en tu mapa.
      </p>
    </div>

    {/* friend light-cone markers — sharper photos provided for this screen */}
    <FriendMarker id="sl-woman" src="/foto-2.png" pos="left-[250px] top-[312px]" size={118} bob="5.4s" />
    <FriendMarker id="sl-man" src="/foto-1.png" pos="left-[128px] top-[438px]" size={134} bob="4.8s" />

    {/* firefly glow + mascot */}
    <div
      className="sl-glow absolute left-[118px] top-[332px] z-[4] w-[210px] h-[210px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 56%, rgba(255,233,2,.34) 0%, rgba(255,191,0,.14) 34%, rgba(255,191,0,0) 64%)', filter: 'blur(6px)' }}
      aria-hidden
    />
    <div className="sl-bee absolute left-[118px] top-[328px] z-[5] w-[158px] -translate-x-1/2 -translate-y-1/2" aria-hidden>
      <FireflyAwake />
    </div>

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
  if (slide.id === 'safe-route') {
    return <SafeRouteSlide slide={slide} onContinue={onContinue} />;
  }
  if (slide.id === 'friends-route') {
    return <FriendsNetworkSlide slide={slide} onContinue={onContinue} />;
  }
  if (slide.id === 'follow-light') {
    return <FollowLightSlide slide={slide} onContinue={onContinue} />;
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
    <div className="flex flex-col h-full flex-shrink-0 px-[22px] pt-16 pb-10 overflow-y-auto" style={{ width: `${100 / TOTAL}%` }}>
      <button onClick={onBack} className="self-start mb-6 text-muted-foreground flex items-center gap-1 text-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Volver
      </button>

      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px] mb-3 text-center text-balance max-w-[320px] mx-auto">Sé una luciérnaga más</h1>
      <p className="mx-auto max-w-[325px] text-muted-foreground font-medium text-[20px] leading-[1.45] mb-7 text-center">
        Únete a la comunidad para cuidar de los tuyos y moverte con total libertad.
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
    <div className="flex flex-col h-full flex-shrink-0 px-[22px] pt-20 pb-10" style={{ width: `${100 / TOTAL}%` }}>
      <h1 className="text-foreground font-bold text-[40px] leading-[1.1] tracking-[-0.5px] mb-3 text-center text-balance max-w-[320px] mx-auto">Sé una luciérnaga más</h1>
      <p className="mx-auto max-w-[325px] text-muted-foreground font-medium text-[20px] leading-[1.45] mb-8 text-center">
        Únete a la comunidad para cuidar de los tuyos y moverte con total libertad.
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
