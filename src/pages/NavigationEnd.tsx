import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Home } from 'lucide-react';

const NavigationEnd: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 rounded-full bg-zenit-green/20 flex items-center justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-zenit-green flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-2">¡Has llegado!</h1>
      <p className="text-muted-foreground text-center mb-8">
        Tu trayecto ha finalizado de forma segura. Tus contactos han sido notificados.
      </p>
      
      <button 
        onClick={() => navigate('/')}
        className="zenit-btn-primary flex items-center justify-center gap-2"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </button>
    </div>
  );
};

export default NavigationEnd;
