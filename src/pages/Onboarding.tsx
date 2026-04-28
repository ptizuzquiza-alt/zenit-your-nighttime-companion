import { FC, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Con Zenit\nno vas a ciegas',
    subtitle: 'Planifica rutas seguras y comparte tu trayecto en tiempo real.',
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

const CityIllustration: FC = () => (
  <img
    src="/city.png"
    alt="Barcelona skyline"
    className="absolute bottom-0 left-1/2 -translate-x-[42%] h-full w-auto max-w-none block"
    onError={(e) => {
      const target = e.currentTarget;
      target.style.display = 'none';
      const fallback = target.nextElementSibling as HTMLElement | null;
      if (fallback) fallback.style.display = 'block';
    }}
  />
);

const CityFallback: FC = () => (
  <svg viewBox="0 0 320 220" className="w-full h-full hidden" fill="none">
    <ellipse cx="160" cy="180" rx="120" ry="40" fill="hsl(265 90% 60% / 0.08)" />
    <rect x="20" y="100" width="35" height="120" rx="2" fill="hsl(249 40% 18%)" />
    <rect x="30" y="80" width="20" height="140" rx="2" fill="hsl(249 38% 20%)" />
    <rect x="60" y="90" width="28" height="130" rx="2" fill="hsl(249 38% 17%)" />
    <rect x="85" y="70" width="22" height="150" rx="2" fill="hsl(249 40% 22%)" />
    <rect x="105" y="95" width="30" height="125" rx="2" fill="hsl(249 38% 18%)" />
    <rect x="165" y="85" width="25" height="135" rx="2" fill="hsl(249 40% 20%)" />
    <rect x="190" y="75" width="32" height="145" rx="2" fill="hsl(249 38% 17%)" />
    <rect x="220" y="92" width="28" height="128" rx="2" fill="hsl(249 40% 22%)" />
    <rect x="248" y="110" width="24" height="110" rx="2" fill="hsl(249 38% 18%)" />
    <rect x="270" y="88" width="35" height="132" rx="2" fill="hsl(249 40% 20%)" />
    {[35, 55, 75, 95, 115, 175, 195, 215, 235].map((x) =>
      [100, 120, 140, 160].map((y) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="3" rx="0.5" fill="hsl(45 100% 50% / 0.15)" />
      ))
    )}
    <line x1="140" y1="180" x2="140" y2="145" stroke="hsl(249 30% 35%)" strokeWidth="2" />
    <circle cx="140" cy="143" r="6" fill="hsl(45 100% 50% / 0.9)" />
    <ellipse cx="140" cy="148" rx="14" ry="5" fill="hsl(45 100% 50% / 0.12)" />
    <rect x="0" y="195" width="320" height="25" fill="hsl(249 40% 10%)" />
    <circle cx="160" cy="52" r="8" fill="hsl(45 100% 50% / 0.9)" />
    <line x1="160" y1="40" x2="160" y2="64" stroke="hsl(45 100% 50%)" strokeWidth="1.5" />
    <line x1="148" y1="52" x2="172" y2="52" stroke="hsl(45 100% 50%)" strokeWidth="1.5" />
  </svg>
);

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

const SlideScreen: FC<{ slide: typeof SLIDES[0]; onContinue: () => void }> = ({ slide, onContinue }) => (
  <div className="flex flex-col h-full flex-shrink-0" style={{ width: `${100 / TOTAL}%` }}>
    <div className="flex flex-col px-6 pt-28 pb-4 items-center text-center">
      <h1
        className={`font-extrabold text-foreground mb-4 whitespace-pre-line w-full ${
          slide.id === 'welcome' ? 'text-[40px] leading-[54px]' : 'text-[32px] leading-[43px]'
        }`}
      >
        {slide.id === 'welcome' ? (
          <>
            <span>Con </span>
            <img
              src="/logo.png"
              alt="Zenit"
              className="inline-block h-[1.05em] align-bottom mx-1"
              style={{ transform: 'translateY(-10px)' }}
            />
            <span className="block">no vas a ciegas</span>
          </>
        ) : (
          slide.title
        )}
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
      {slide.illustration === 'city' ? (
        <div className="w-full flex-1 min-h-0 overflow-hidden relative">
          <CityIllustration />
          <CityFallback />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(249 42% 12%) 0%, transparent 40%)' }} />
        </div>
      ) : slide.illustration === 'share' ? (
        <div className="flex-1 flex items-start justify-center overflow-hidden relative">
          <img src="/Navigation - Shared - new.png" alt="Compartir ruta" className="w-full h-full object-cover object-top" />
          <div
            className="absolute inset-x-0 bottom-0 h-80 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.98) 8%, rgba(15, 23, 42, 0.92) 18%, rgba(15, 23, 42, 0.72) 32%, rgba(15, 23, 42, 0.4) 52%, rgba(15, 23, 42, 0.1) 72%, rgba(15, 23, 42, 0) 100%)' }}
          />
        </div>
      ) : (
        <div className="w-full flex-1 flex items-center overflow-hidden relative">
          <img
            src={slide.illustration === 'route' ? '/Navigation - ruta.png' : '/Navigation - Shared - new.png'}
            alt={slide.illustration === 'route' ? 'Ruta segura' : 'Ruta de amigos'}
            className={`w-full h-full ${slide.illustration === 'route' ? 'object-contain object-center' : 'object-cover object-center'}`}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, hsl(249 42% 12%) 0%, transparent 40%)' }} />
        </div>
      )}
    </div>
  </div>
);

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

const RegisterScreen: FC<{ onSubmit: () => void; onBack: () => void }> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <input type="tel" placeholder="Número de teléfono" value={phone} onChange={e => setPhone(e.target.value)} className={INPUT_CLS} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT_CLS} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className={INPUT_CLS} />
      </div>

      <button onClick={onSubmit} className="w-full py-4 rounded-full bg-accent text-background font-bold text-base mb-4">
        Crear cuenta
      </button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onBack} className="text-foreground underline">Inicia sesión</button>
      </p>
    </div>
  );
};

// ─── Login screen ───────────────────────────────────────────────

const LoginScreen: FC<{ onLogin: () => void; onRegister: () => void }> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      <button onClick={onLogin} className="w-full py-4 rounded-full bg-accent text-background font-bold text-base mb-4">
        Iniciar sesión
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
        <button onClick={onLogin} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium">
          <GoogleIcon /> Google
        </button>
        <button onClick={onLogin} className="flex-1 py-3 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-medium">
          <AppleIcon /> Apple
        </button>
      </div>
    </div>
  );
};

// ─── Main onboarding ────────────────────────────────────────────

const Onboarding: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [subScreen, setSubScreen] = useState<'login' | 'register' | 'location'>('login');
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
          <RegisterScreen onSubmit={handleRequestLocation} onBack={() => setSubScreen('login')} />
        ) : (
          <LoginScreen onLogin={handleRequestLocation} onRegister={() => setSubScreen('register')} />
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
