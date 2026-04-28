import { FC, useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
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
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; name: string; removing: boolean } | null>(null);

  // Sync with external state only when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelected);
      setConfirm(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id: string, name: string) => {
    const removing = selected.includes(id);
    setConfirm({ id, name, removing });
  };

  const handleConfirm = () => {
    if (!confirm) return;
    setSelected(prev =>
      confirm.removing ? prev.filter(x => x !== confirm.id) : [...prev, confirm.id]
    );
    setConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">Compartir tu ruta</h2>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">
          Selecciona las personas que podrán acompañar tu ruta hasta que llegues a tu destino.
        </p>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="zenit-input pl-12"
          />
        </div>
        
        <p className="text-sm font-medium text-muted-foreground mb-3">Recientes</p>
        
        <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
          {filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => toggleContact(contact.id, contact.name)}
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
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected.includes(contact.id) 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/50'
              }`}>
                {selected.includes(contact.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onShare(selected)}
          disabled={selected.length === 0}
          className="zenit-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compartir
        </button>
        
        <button onClick={onClose} className="zenit-btn-secondary mt-3">
          Cancelar
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50 rounded-t-3xl" onClick={() => setConfirm(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-5 w-full shadow-xl">
            <p className="text-foreground font-semibold text-base mb-2">
              {confirm.removing ? 'Dejar de compartir' : 'Compartir ruta'}
            </p>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {confirm.removing
                ? `¿Vas a dejar de compartir tu ruta con ${confirm.name}. ¿Quieres continuar?`
                : `¿Vas a compartir tu ruta con ${confirm.name}. ¿Quieres continuar?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3 rounded-xl font-medium text-sm text-white ${confirm.removing ? 'bg-destructive' : 'bg-primary'}`}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
