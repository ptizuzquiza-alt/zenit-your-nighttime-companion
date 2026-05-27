import { FC, useState, useEffect } from 'react';
import { Search, Share2 } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status?: 'idle' | 'pending' | 'sharing';
}

interface ShareRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (selectedContacts: string[]) => void;
  contacts: Contact[];
  initialSelected?: string[];
}

export const ShareRouteModal: FC<ShareRouteModalProps> = ({
  isOpen,
  onClose,
  onShare,
  contacts,
  initialSelected = [],
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [pending, setPending] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [initialSharedIds, setInitialSharedIds] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{
    id: string;
    name: string;
    action: 'share' | 'unshare' | 'cancel';
  } | null>(null);

  // Sync with external state only when modal opens
  useEffect(() => {
    if (isOpen) {
      const sharingFromContacts = contacts
        .filter(contact => contact.status === 'sharing')
        .map(contact => contact.id);
      const pendingFromContacts = contacts
        .filter(contact => contact.status === 'pending')
        .map(contact => contact.id);
      const initialShareSet = Array.from(
        new Set([...initialSelected, ...sharingFromContacts])
      );
      setSelected(initialShareSet);
      setInitialSharedIds(initialShareSet);
      setPending(pendingFromContacts);
      setConfirm(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const shareCount = selected.length;
  const hasShareChanges =
    selected.length !== initialSharedIds.length ||
    selected.some(id => !initialSharedIds.includes(id));

  const getStatus = (contact: Contact) => {
    if (contact.status) return contact.status;
    if (selected.includes(contact.id)) return 'sharing';
    if (pending.includes(contact.id)) return 'pending';
    return 'idle';
  };

  const handleActionClick = (contact: Contact) => {
    const status = getStatus(contact);
    if (status === 'sharing') {
      setConfirm({ id: contact.id, name: contact.name, action: 'unshare' });
      return;
    }
    if (status === 'pending') {
      setPending(prev => prev.filter(x => x !== contact.id));
      return;
    }
    setSelected(prev => (prev.includes(contact.id) ? prev : [...prev, contact.id]));
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.action === 'cancel') {
      setConfirm(null);
      onClose();
      return;
    }
    setSelected(prev => prev.filter(x => x !== confirm.id));
    setConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-3xl p-6 animate-slide-up">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-foreground">Compartir tu ruta</h2>
        </div>

        {/* Count banner */}
        <div className="flex items-center gap-4 rounded-2xl bg-[#5B568A] px-4 py-3 mb-4">
          <div className="flex items-center gap-2 rounded-full border border-white px-4 py-3 text-white">
            <Share2 className="w-5 h-5" />
            <span className="text-lg">{shareCount}</span>
          </div>
          <p className="text-sm text-white/90">
            Amigos que pueden ver tu ubicacion en directo hasta el final del trayecto actual.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 rounded-full bg-muted px-4 py-2.5 mb-4">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        
        <p className="text-sm font-medium text-muted-foreground mb-3">Recientes</p>
        
        {/* Contacts list */}
        <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
          {filteredContacts.map(contact => {
            const status = getStatus(contact);
            const actionLabel =
              status === 'sharing'
                ? 'Dejar de compartir'
                : status === 'pending'
                  ? 'Deshacer invitacion'
                  : 'Compartir tu ruta';
            const actionClass =
              status === 'sharing'
                ? 'bg-destructive text-destructive-foreground'
                : status === 'pending'
                  ? 'bg-[#6B63A5] text-white'
                  : 'bg-primary text-white';

            return (
              <div
                key={contact.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${contact.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} bg-secondary`}>
                  {contact.avatar ? (
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{contact.name[0]}</span>
                  )}
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{contact.name}</span>
                <button
                  onClick={() => handleActionClick(contact)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${actionClass}`}
                >
                  {actionLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <button
          onClick={() => {
            if (hasShareChanges) {
              setConfirm({ id: '', name: '', action: 'cancel' });
              return;
            }
            onClose();
          }}
          className="zenit-btn-secondary"
        >
          Cancelar
        </button>

        <button
          onClick={() => onShare(selected)}
          disabled={!hasShareChanges}
          className="zenit-btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          Salvar cambios
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50 rounded-t-3xl" onClick={() => setConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-5 w-full shadow-xl">
            <p className="text-foreground font-semibold text-center text-base mb-2">
              {confirm.action === 'unshare'
                ? 'Dejar de compartir'
                : confirm.action === 'cancel'
                  ? '¿Salir sin guardar tus cambios?'
                  : 'Compartir ruta'}
            </p>
            <p className="text-sm text-center mb-5">
              {confirm.action === 'unshare'
                ? `¿Dejar de compartir tu ruta con ${confirm.name}?`
                : confirm.action === 'cancel'
                  ? 'Todos los cambios que has hecho no serán aplicados.'
                  : `Vas a compartir tu ruta con ${confirm.name}. ¿Quieres continuar?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-popover text-foreground font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-xl font-medium text-sm text-white ${confirm.action === 'unshare' ? 'bg-destructive' : 'bg-destructive'}`}
              >
                {confirm.action === 'cancel' ? 'Salir sin guardar' : 'Dejar de compartir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
