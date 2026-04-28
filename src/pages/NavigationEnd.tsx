import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Home, AlertTriangle } from 'lucide-react';

const NavigationEnd: FC = () => {
  const navigate = useNavigate();
  const [alerted, setAlerted] = useState(false);

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
      
      <button
        onClick={() => navigate('/')}
        className="zenit-btn-primary flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </button>

      {alerted ? (
        <p className="mt-4 text-sm text-zenit-green text-center">
          Tus contactos han sido notificados del problema.
        </p>
      ) : (
        <button
          onClick={() => setAlerted(true)}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors px-4 text-center"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          No he llegado aún, o ha habido un problema, notificar a mis contactos
        </button>
      )}
    </div>
  );
};

export default NavigationEnd;
