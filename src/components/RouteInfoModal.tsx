import { FC } from 'react';
import { X, Lightbulb, Maximize2, Route } from 'lucide-react';

interface RouteInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteInfoModal: FC<RouteInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-3xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Sobre tu ruta</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          La Ruta Zenit prioriza tu seguridad teniendo en cuenta:
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Buena iluminación</p>
              <p className="text-xs text-muted-foreground">Calles con puntos de luz frecuentes</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Maximize2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Calles anchas</p>
              <p className="text-xs text-muted-foreground">Vías principales y avenidas amplias</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Route className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Vías principales</p>
              <p className="text-xs text-muted-foreground">Recorridos por calles transitadas y activas</p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="zenit-btn-primary mt-6">
          Entendido
        </button>
      </div>
    </div>
  );
};
