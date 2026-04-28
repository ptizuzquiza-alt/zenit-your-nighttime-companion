import { FC } from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { AVATAR_BY_NAME } from '@/config/contacts';

interface PendingRequest {
  id: string;
  name: string;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const PendingRequestsList: FC<PendingRequestsListProps> = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
        <UserPlus className="w-3.5 h-3.5" />
        Solicitudes de ubicación
      </p>
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center gap-3 rounded-2xl bg-card/90 backdrop-blur-md border border-border p-3"
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${req.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} bg-accent/20`}>
            {AVATAR_BY_NAME[req.name] ? (
              <img src={AVATAR_BY_NAME[req.name]} alt={req.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-accent">{req.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">{req.name}</p>
            <p className="text-xs text-muted-foreground">Quiere compartir su ubicación</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onReject(req.id)}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAccept(req.id)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
