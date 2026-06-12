import { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Home, AlertTriangle } from 'lucide-react';
import { LuciTutorial } from '@/components/LuciTutorial';
import { isTutorialSeen, markTutorialSeen } from '@/lib/tutorials';

const NavigationEnd: FC = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(() => !isTutorialSeen('navigationEnd'));

  return (
    <div className="h-[100dvh] bg-background flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-zenit-green/15 flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-zenit-green flex items-center justify-center">
            <Check className="w-8 h-8 text-background" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">¡Has llegado!</h1>
        <p className="w-72 text-muted-foreground text-center mb-4">
          ¡Esperamos que tu trayecto haya finalizado de forma segura!
        </p>
        <p className="w-80 text-muted-foreground text-center mb-4">
        Tus contactos han sido notificados de tu llegada y tu ubicación ya no se comparte.
        </p>

        {showTutorial && (
          <div className="w-full max-w-md px-4 mb-8">
            <LuciTutorial
              message={(
                <>
                  Tu ubicación <strong className="text-accent">no será</strong> compartida hasta que compartas tu próxima ruta.
                </>
              )}
              onClose={() => {
                markTutorialSeen('navigationEnd');
                setShowTutorial(false);
              }}
              showPortrait
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-md mx-auto flex flex-col gap-4">
        <button
          onClick={() => navigate('/')}
          className="zenit-btn-primary w-full flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </button>

        <button
          onClick={() => navigate('/navigation', { state: { showProblemModal: true } })}
          className="zenit-btn-secondary w-full flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--zenit-yellow))' }} />
          Aún no he llegado
        </button>
      </div>
    </div>
  );
};

export default NavigationEnd;
