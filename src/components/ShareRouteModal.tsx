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

  // Sync with external state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelected);
    }
  }, [isOpen, initialSelected]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
              onClick={() => toggleContact(contact.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
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
    </div>
  );
};
