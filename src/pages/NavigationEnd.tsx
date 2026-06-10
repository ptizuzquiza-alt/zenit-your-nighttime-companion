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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 rounded-full bg-zenit-green/20 flex items-center justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-zenit-green flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">¡Has llegado!</h1>
      <p className="text-muted-foreground text-center mb-4">
        Tu trayecto ha finalizado de forma segura. Tus contactos han sido notificados.
      </p>
      <p className="text-sm text-muted-foreground/80 text-center mb-8 px-4">
        Tu ubicación no será compartida hasta que compartas tu próxima ruta.
      </p>

      {showTutorial && (
        <div className="w-full max-w-md px-4 mb-8">
          <LuciTutorial
            message={(
              <>
                Tu ubicación no será <strong className="text-accent">compartida</strong>
                hasta que compartas tu próxima ruta.
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

      <button
        onClick={() => navigate('/')}
        className="zenit-btn-primary flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </button>

      <button
        onClick={() => navigate('/navigation', { state: { showProblemModal: true } })}
        className="mt-4 zenit-btn-secondary flex items-center justify-center gap-2"
      >
        <AlertTriangle className="w-5 h-5 shrink-0" />
        Aún no he llegado
      </button>
    </div>
  );
};

export default NavigationEnd;
