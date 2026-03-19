import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Search, Users, Check, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: string;
  name: string;
  members: string[];
}

const ALL_FRIENDS = [
  { id: 'juan', name: 'Juan' },
  { id: 'marta', name: 'Marta' },
];

const PENDING_REQUESTS = [
  { id: 'ana', name: 'Ana' },
];

const Friends: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_groups') || '[]');
    } catch {
      return [];
    }
  });
  const [pendingRequests, setPendingRequests] = useState(PENDING_REQUESTS);

  const handleSendRequest = () => {
    const name = searchQuery.trim();
    if (!name) return;
    toast.success(`Solicitud enviada a ${name}`);
    setSearchQuery('');
  };

  const handleAccept = (id: string, name: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    toast.success(`Ahora sigues a ${name}`);
  };

  const handleIgnore = (id: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName.trim(),
      members: selectedMembers,
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    sessionStorage.setItem('zenit_groups', JSON.stringify(updated));
    setGroupName('');
    setSelectedMembers([]);
    setShowCreateGroup(false);
    toast.success(`Grupo "${newGroup.name}" creado`);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background flex flex-col">
      {/* Top bar */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between">
        <h1 className="text-foreground font-semibold text-lg">Amigos</h1>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center"
        >
          <User className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">

        {/* Search / add friend */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar o añadir amigos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendRequest()}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery.trim() && (
              <button
                onClick={handleSendRequest}
                className="text-xs text-primary font-medium px-2 py-1 rounded-lg bg-primary/10"
              >
                Añadir
              </button>
            )}
          </div>
        </div>

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Solicitudes pendientes
            </p>
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {req.name[0]}
                  </span>
                </div>
                <span className="flex-1 text-foreground text-sm font-medium">{req.name}</span>
                <button
                  onClick={() => handleAccept(req.id, req.name)}
                  className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => handleIgnore(req.id)}
                  className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Mis amigos
          </p>
          {ALL_FRIENDS.map(friend => (
            <div
              key={friend.id}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {friend.name[0]}
                </span>
              </div>
              <span className="flex-1 text-foreground text-sm font-medium">{friend.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground">Activo</span>
              </div>
            </div>
          ))}
        </div>

        {/* Groups */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grupos
            </p>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear
            </button>
          </div>

          {groups.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1 py-2">
              Aún no tienes grupos. Crea uno para compartir tu ruta con varios amigos a la vez.
            </p>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create group modal */}
      {showCreateGroup && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold">Crear grupo</h2>
              <button
                onClick={() => { setShowCreateGroup(false); setGroupName(''); setSelectedMembers([]); }}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Nombre del grupo (ej. Familia)"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Añadir miembros</p>
              {ALL_FRIENDS.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => toggleMember(friend.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-xs">{friend.name[0]}</span>
                  </div>
                  <span className="flex-1 text-foreground text-sm">{friend.name}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedMembers.includes(friend.id)
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  }`}>
                    {selectedMembers.includes(friend.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              Crear grupo
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-8 z-[1000]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center text-muted-foreground w-12 h-12"
        >
          <Map className="w-6 h-6" />
        </button>
        <button className="flex items-center justify-center text-primary w-12 h-12">
          <Users className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Friends;
