import { FC } from 'react';
import { AVATAR_BY_NAME } from '@/config/contacts';

interface FriendRequest {
  id: string;
  name: string;
}

interface FriendRequestModalProps {
  request: FriendRequest | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const FriendRequestModal: FC<FriendRequestModalProps> = ({ request, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${request.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : 'bg-accent/20 border-2 border-accent'}`}>
            {AVATAR_BY_NAME[request.name] ? (
              <img src={AVATAR_BY_NAME[request.name]} alt={request.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-accent">{request.name[0]}</span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground text-center mb-2">
          Solicitud de ubicación
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          <span className="text-foreground font-semibold">{request.name}</span> quiere compartir su ubicación contigo.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 py-3 rounded-2xl bg-secondary text-foreground font-semibold transition-colors hover:bg-secondary/80"
          >
            Rechazar
          </button>
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold transition-colors hover:bg-primary/90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
