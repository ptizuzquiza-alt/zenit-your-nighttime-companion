import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Search, Users, Check, X, Plus, Share2, ChevronRight, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { AVATAR_BY_NAME } from '@/config/contacts';

interface Group {
  id: string;
  name: string;
  members: string[];
}

const ALL_FRIENDS = [
  { id: 'juan', name: 'Juan' },
  { id: 'marta', name: 'Marta' },
  { id: 'javier', name: 'Javier' },
];

const PENDING_REQUESTS = [
  { id: 'carla', name: 'Carla' },
];

const Friends: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const currentUserName = typeof window !== 'undefined' ? localStorage.getItem('zenit_name') || 'Patricia' : 'Patricia';
  const [friends, setFriends] = useState(ALL_FRIENDS);
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [addToGroupMembers, setAddToGroupMembers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('zenit_groups') || '[]');
    } catch {
      return [];
    }
  });
  const [pendingRequests, setPendingRequests] = useState(PENDING_REQUESTS);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

  const handleSendRequest = () => {
    const name = searchQuery.trim();
    if (!name) return;
    toast.success(`Solicitud enviada a ${name}`);
    setSearchQuery('');
  };

  const handleAccept = (id: string, name: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    setFriends(prev => {
      if (prev.some(friend => friend.id === id)) return prev;
      return [...prev, { id, name }];
    });
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

  const saveGroups = (updated: Group[]) => {
    setGroups(updated);
    sessionStorage.setItem('zenit_groups', JSON.stringify(updated));
  };

  const handleDeleteGroup = (id: string) => {
    saveGroups(groups.filter(g => g.id !== id));
    setSelectedGroup(null);
    toast.success('Grupo eliminado');
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    const updated = groups.map(g =>
      g.id === groupId ? { ...g, members: g.members.filter(m => m !== memberId) } : g
    );
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === groupId) ?? null);
  };

  const handleAddToGroup = () => {
    if (!selectedGroup) return;
    const updated = groups.map(g =>
      g.id === selectedGroup.id
        ? { ...g, members: [...new Set([...g.members, ...addToGroupMembers])] }
        : g
    );
    saveGroups(updated);
    setSelectedGroup(updated.find(g => g.id === selectedGroup.id) ?? null);
    setShowAddToGroup(false);
    setAddToGroupMembers([]);
    toast.success('Miembros añadidos');
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName.trim(),
      members: selectedMembers,
    };
    const updated = [...groups, newGroup];
    saveGroups(updated);
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
          className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden"
        >
          {AVATAR_BY_NAME[currentUserName] ? (
            <img src={AVATAR_BY_NAME[currentUserName]} alt={currentUserName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">

        {/* Share profile */}
        <button
          onClick={() => {
            const msg = '¡Únete a Zenit, la app para caminar seguro de noche! Añádeme como amigo: @patricia\nhttps://zenit.app';
            if (navigator.share) {
              navigator.share({ text: msg });
            } else {
              navigator.clipboard.writeText(msg);
              toast.success('Enlace copiado al portapapeles');
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-left"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Compartir perfil</p>
            <p className="text-xs text-muted-foreground">Invita a amigos a unirse a Zenit</p>
          </div>
        </button>

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
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${req.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} bg-primary/20`}>
                {AVATAR_BY_NAME[req.name] ? (
                  <img src={AVATAR_BY_NAME[req.name]} alt={req.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {req.name[0]}
                  </span>
                )}
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
          {friends.map(friend => (
            <div
              key={friend.id}
              className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${friend.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} bg-primary/20`}>
                {AVATAR_BY_NAME[friend.name] ? (
                  <img src={AVATAR_BY_NAME[friend.name]} alt={friend.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-sm">
                    {friend.name[0]}
                  </span>
                )}
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
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-left"
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
              </button>
            ))
          )}
        </div>
      </div>

      {/* Create group modal */}
      {showCreateGroup && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
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

      {/* Group detail sheet */}
      {selectedGroup && !showAddToGroup && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-foreground font-semibold">{selectedGroup.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedGroup.members.length} {selectedGroup.members.length === 1 ? 'miembro' : 'miembros'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Members */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Miembros</p>
              {selectedGroup.members.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin miembros aún.</p>
              ) : (
                selectedGroup.members.map(memberId => {
                  const friend = ALL_FRIENDS.find(f => f.id === memberId);
                  if (!friend) return null;
                  return (
                    <div key={memberId} className="flex items-center gap-3 bg-background rounded-xl px-3 py-2.5 border border-border">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-xs">{friend.name[0]}</span>
                      </div>
                      <span className="flex-1 text-sm text-foreground">{friend.name}</span>
                      <button
                        onClick={() => handleRemoveMember(selectedGroup.id, memberId)}
                        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => { setShowAddToGroup(true); setAddToGroupMembers([]); }}
              className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Añadir miembro
            </button>

            <button
              onClick={() => setConfirmDeleteGroup(true)}
              className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar grupo
            </button>
          </div>
        </div>
      )}

      {/* Add members to group sheet */}
      {selectedGroup && showAddToGroup && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold">Añadir a {selectedGroup.name}</h2>
              <button
                onClick={() => setShowAddToGroup(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {ALL_FRIENDS.filter(f => !selectedGroup.members.includes(f.id)).map(friend => (
                <button
                  key={friend.id}
                  onClick={() => setAddToGroupMembers(prev =>
                    prev.includes(friend.id) ? prev.filter(m => m !== friend.id) : [...prev, friend.id]
                  )}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-xs">{friend.name[0]}</span>
                  </div>
                  <span className="flex-1 text-sm text-foreground">{friend.name}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    addToGroupMembers.includes(friend.id) ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {addToGroupMembers.includes(friend.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                </button>
              ))}
              {ALL_FRIENDS.every(f => selectedGroup.members.includes(f.id)) && (
                <p className="text-xs text-muted-foreground px-1">Todos tus amigos ya están en este grupo.</p>
              )}
            </div>
            <button
              onClick={handleAddToGroup}
              disabled={addToGroupMembers.length === 0}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40"
            >
              Añadir
            </button>
          </div>
        </div>
      )}

      {/* Confirm delete group popup */}
      {confirmDeleteGroup && selectedGroup && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1200] flex items-center justify-center px-6">
          <div className="w-full bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-foreground font-semibold text-base">¿Eliminar grupo?</h3>
              <p className="text-muted-foreground text-sm">
                El grupo <span className="font-medium text-foreground">"{selectedGroup.name}"</span> se eliminará permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteGroup(false)}
                className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmDeleteGroup(false); handleDeleteGroup(selectedGroup.id); }}
                className="flex-1 py-3 rounded-2xl bg-destructive text-white font-semibold text-sm"
              >
                Eliminar
              </button>
            </div>
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
