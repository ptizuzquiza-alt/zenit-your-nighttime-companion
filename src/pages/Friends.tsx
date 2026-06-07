import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Search, Users, Check, X, Plus, Share2, ChevronRight, Trash2, UserPlus, UserMinus, Link, Download } from 'lucide-react';
import { toast } from 'sonner';
import { toDataURL } from 'qrcode';
import { AVATAR_BY_NAME, DEFAULT_FRIENDS, SHARING_ROUTE_IDS } from '@/config/contacts';
import { useAuth, DEMO_EMAIL } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Group {
  id: string;
  name: string;
  members: string[];
}

type Friend = { id: string; name: string };

const DISCOVERABLE_USERS: Friend[] = [
  { id: 'juan', name: 'Juan' },
  { id: 'marta', name: 'Marta' },
  { id: 'carla', name: 'Carla' },
  { id: 'javier', name: 'Javier' },
  { id: 'ana', name: 'Ana' },
];

const Friends: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [friends, setFriends] = useState<Friend[]>(() => {
    const stored = localStorage.getItem('zenit_friends');
    if (stored !== null) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    // Cuenta existente (Patricia) — seed con amigos y nombre por defecto
    const defaults = DEFAULT_FRIENDS;
    localStorage.setItem('zenit_friends', JSON.stringify(defaults));
    if (!localStorage.getItem('zenit_name')) localStorage.setItem('zenit_name', 'Patricia');
    return defaults;
  });
  const [pendingRequests, setPendingRequests] = useState<Friend[]>(() => {
    const stored = localStorage.getItem('zenit_pending_requests');
    if (stored !== null) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    const defaults = [{ id: 'carla', name: 'Carla' }];
    localStorage.setItem('zenit_pending_requests', JSON.stringify(defaults));
    return defaults;
  });
  const [sentRequests, setSentRequests] = useState<Friend[]>(() => {
    const stored = localStorage.getItem('zenit_sent_requests');
    if (stored !== null) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    return [];
  });
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [addToGroupMembers, setAddToGroupMembers] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>(() => {
    try { return JSON.parse(localStorage.getItem('zenit_groups') || '[]'); } catch { return []; }
  });
  const [currentUserName] = useState(() => localStorage.getItem('zenit_name') || 'Tú');
  const [profilePhoto] = useState(() => localStorage.getItem('zenit_photo'));
  const [viewFriend, setViewFriend] = useState<Friend | null>(null);
  const [confirmUnfriend, setConfirmUnfriend] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const profileUrl = `https://zenit.app/u/${currentUserName.toLowerCase()}`;

  useEffect(() => {
    if (showShareModal) {
      toDataURL(profileUrl, { width: 240, errorCorrectionLevel: 'H', color: { dark: '#1a0a2e', light: '#ffffff' }, margin: 2 })
        .then(setQrDataUrl);
    }
  }, [showShareModal, profileUrl]);

  // Supabase profile search results
  const [supabaseResults, setSupabaseResults] = useState<Friend[]>([]);

  // Load friends and pending requests from Supabase when authenticated (skip for demo account)
  useEffect(() => {
    if (!user || user.email === DEMO_EMAIL) return;
    const loadFromSupabase = async () => {
      try {
        const { data: fships } = await supabase
          .from('friendships' as never)
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`) as { data: Array<{user_id: string, friend_id: string}> | null };

        if (fships && fships.length > 0) {
          const ids = fships.map(f => f.user_id === user.id ? f.friend_id : f.user_id);
          const { data: profiles } = await supabase
            .from('profiles' as never)
            .select('id, name, username, avatar_url')
            .in('id', ids) as { data: Array<{id: string, name: string, username: string, avatar_url: string | null}> | null };
          if (profiles) {
            // Merge Supabase friends with any existing local (mock) friends
            setFriends(prev => {
              const sbFriends = profiles.map(p => ({ id: p.id, name: p.name }));
              const merged = [
                ...sbFriends,
                ...prev.filter(f => !sbFriends.some(sb => sb.id === f.id)),
              ];
              localStorage.setItem('zenit_friends', JSON.stringify(merged));
              return merged;
            });
          }
        }
        // If Supabase returns 0 friendships, keep whatever is in localStorage (mock friends)

        const { data: reqs } = await supabase
          .from('friend_requests' as never)
          .select('sender_id')
          .eq('receiver_id', user.id) as { data: Array<{sender_id: string}> | null };

        if (reqs && reqs.length > 0) {
          const sIds = reqs.map(r => r.sender_id);
          const { data: sProfiles } = await supabase
            .from('profiles' as never)
            .select('id, name')
            .in('id', sIds) as { data: Array<{id: string, name: string}> | null };
          if (sProfiles) {
            setPendingRequests(prev => {
              const sbReqs = sProfiles.map(p => ({ id: p.id, name: p.name }));
              const merged = [
                ...sbReqs,
                ...prev.filter(r => !sbReqs.some(sb => sb.id === r.id)),
              ];
              localStorage.setItem('zenit_pending_requests', JSON.stringify(merged));
              return merged;
            });
          }
        }
        // If no Supabase requests, keep localStorage (may have simulated requests)

        // Sent requests — ones the current user has sent and is waiting on
        const { data: sentReqs } = await supabase
          .from('friend_requests' as never)
          .select('receiver_id')
          .eq('sender_id', user.id) as { data: Array<{receiver_id: string}> | null };

        if (sentReqs && sentReqs.length > 0) {
          const rIds = sentReqs.map(r => r.receiver_id);
          const { data: rProfiles } = await supabase
            .from('profiles' as never)
            .select('id, name')
            .in('id', rIds) as { data: Array<{id: string, name: string}> | null };
          if (rProfiles) {
            setSentRequests(prev => {
              const sbSent = rProfiles.map(p => ({ id: p.id, name: p.name }));
              const merged = [
                ...sbSent,
                ...prev.filter(r => !sbSent.some(sb => sb.id === r.id)),
              ];
              localStorage.setItem('zenit_sent_requests', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch { /* tables don't exist yet — keep localStorage */ }
    };
    loadFromSupabase();
  }, [user]);

  // Search Supabase profiles as the user types
  useEffect(() => {
    if (!user || user.email === DEMO_EMAIL || !searchQuery.trim()) {
      setSupabaseResults([]);
      return;
    }
    const q = searchQuery.trim();
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('profiles' as never)
          .select('id, name, username')
          .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
          .neq('id', user.id)
          .limit(5) as { data: Array<{id: string, name: string, username: string}> | null };
        if (data) setSupabaseResults(data.map(p => ({ id: p.id, name: p.name })));
      } catch { setSupabaseResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleShareLink = () => {
    const msg = `¡Únete a Zenit, la app para caminar seguro de noche! Añádeme como amigo: @${currentUserName.toLowerCase()}\n${profileUrl}`;
    if (navigator.share) {
      navigator.share({ text: msg });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const persistFriends = (updated: Friend[]) => {
    setFriends(updated);
    localStorage.setItem('zenit_friends', JSON.stringify(updated));
  };

  const persistPending = (updated: Friend[]) => {
    setPendingRequests(updated);
    localStorage.setItem('zenit_pending_requests', JSON.stringify(updated));
  };

  const persistSent = (updated: Friend[]) => {
    setSentRequests(updated);
    localStorage.setItem('zenit_sent_requests', JSON.stringify(updated));
  };

  // Detect if an ID is a real Supabase UUID
  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleSendRequest = (friend: Friend) => {
    const { id, name } = friend;
    setSearchQuery('');
    setSupabaseResults([]);

    const targetId = id || name.toLowerCase().replace(/\s+/g, '-');

    // Optimistically add to "sent" locally — works for both real and mock users
    setSentRequests(prev => {
      if (prev.some(r => r.id === targetId)) return prev;
      const updated = [...prev, { id: targetId, name }];
      localStorage.setItem('zenit_sent_requests', JSON.stringify(updated));
      return updated;
    });

    if (user && !user.email?.includes(DEMO_EMAIL) && isUUID(id)) {
      // Real user → insert into Supabase friend_requests
      supabase
        .from('friend_requests' as never)
        .insert({ sender_id: user.id, receiver_id: id } as never)
        .then(() => toast.success(`Solicitud enviada a ${name}`));
    } else {
      // Mock user (demo contacts) — simulate the other side accepting after 3s
      toast.success(`Solicitud enviada a ${name}`);
      setTimeout(() => {
        setSentRequests(prevSent => {
          if (!prevSent.some(r => r.id === targetId)) return prevSent;
          const updatedSent = prevSent.filter(r => r.id !== targetId);
          localStorage.setItem('zenit_sent_requests', JSON.stringify(updatedSent));
          return updatedSent;
        });
        setFriends(prevFriends => {
          if (prevFriends.some(f => f.id === targetId)) return prevFriends;
          const updatedFriends = [...prevFriends, { id: targetId, name }];
          localStorage.setItem('zenit_friends', JSON.stringify(updatedFriends));
          toast.success(`${name} ha aceptado tu solicitud`);
          return updatedFriends;
        });
      }, 8000);
    }
  };

  const handleCancelSent = (id: string, name: string) => {
    persistSent(sentRequests.filter(r => r.id !== id));
    if (user && !user.email?.includes(DEMO_EMAIL) && isUUID(id)) {
      supabase
        .from('friend_requests' as never)
        .delete()
        .eq('sender_id', user.id)
        .eq('receiver_id', id)
        .then();
    }
    toast(`Solicitud a ${name} cancelada`);
  };

  const handleAccept = (id: string, name: string) => {
    persistPending(pendingRequests.filter(r => r.id !== id));
    if (!friends.some(f => f.id === id)) {
      persistFriends([...friends, { id, name }]);
    }

    if (user && !user.email?.includes(DEMO_EMAIL) && isUUID(id)) {
      // Save bidirectional friendship to Supabase and remove the request
      supabase
        .from('friendships' as never)
        .insert([
          { user_id: user.id, friend_id: id } as never,
          { user_id: id, friend_id: user.id } as never,
        ])
        .then();
      supabase
        .from('friend_requests' as never)
        .delete()
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
        .then();
    }

    toast.success(`Ahora eres amigo/a de ${name}`);
  };

  const handleIgnore = (id: string) => {
    persistPending(pendingRequests.filter(r => r.id !== id));
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const saveGroups = (updated: Group[]) => {
    setGroups(updated);
    localStorage.setItem('zenit_groups', JSON.stringify(updated));
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
          {profilePhoto || AVATAR_BY_NAME[currentUserName] ? (
            <img src={profilePhoto || AVATAR_BY_NAME[currentUserName] || ''} alt={currentUserName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">

        {/* Share profile */}
        <button
          onClick={() => setShowShareModal(true)}
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
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const q = searchQuery.trim().toLowerCase();
                  const match =
                    supabaseResults.find(u => u.name.toLowerCase() === q) ||
                    DISCOVERABLE_USERS.find(u => u.name.toLowerCase() === q);
                  if (match) handleSendRequest(match);
                }
              }}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* User suggestions / no results */}
          {(() => {
            if (!searchQuery.trim()) return null;

            // Combine Supabase real results + mock DISCOVERABLE_USERS
            const mockSuggestions = DISCOVERABLE_USERS.filter(u =>
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !friends.some(f => f.id === u.id) &&
              !pendingRequests.some(r => r.id === u.id) &&
              !sentRequests.some(r => r.id === u.id)
            );
            const allSuggestions: Friend[] = [
              ...supabaseResults.filter(
                sr => !friends.some(f => f.id === sr.id)
                  && !pendingRequests.some(r => r.id === sr.id)
                  && !sentRequests.some(r => r.id === sr.id)
              ),
              ...mockSuggestions.filter(m => !supabaseResults.some(sr => sr.id === m.id)),
            ];

            if (allSuggestions.length === 0) {
              return (
                <p className="text-xs text-muted-foreground px-1 py-2">
                  No se encontró ningún usuario con ese nombre.
                </p>
              );
            }
            return (
              <div className="space-y-1">
                {allSuggestions.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleSendRequest(u)}
                    className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-[#9E9AB3] bg-primary/20">
                      {AVATAR_BY_NAME[u.name] ? (
                        <img src={AVATAR_BY_NAME[u.name]} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-semibold text-sm">{u.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.name.toLowerCase()}</p>
                    </div>
                    <span className="text-xs text-primary font-medium px-2.5 py-1 rounded-lg bg-primary/10 flex-shrink-0">
                      Añadir
                    </span>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Pending requests — received (waiting on you to accept) */}
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Solicitudes recibidas
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
                  className="w-8 h-8 rounded-full bg-green-500/80 flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleIgnore(req.id)}
                  className="w-8 h-8 rounded-full bg-destructive/85 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sent requests — waiting on the other person to accept */}
        {sentRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Solicitudes enviadas
            </p>
            {sentRequests.map(req => (
              <div
                key={req.id}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-[#9E9AB3] bg-primary/20">
                  {AVATAR_BY_NAME[req.name] ? (
                    <img src={AVATAR_BY_NAME[req.name]} alt={req.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-semibold text-sm">{req.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium">{req.name}</p>
                  <p className="text-xs text-muted-foreground">Esperando respuesta</p>
                </div>
                <button
                  onClick={() => handleCancelSent(req.id, req.name)}
                  className="text-xs text-muted-foreground font-medium px-3 py-1.5 rounded-lg bg-card border border-border flex-shrink-0"
                >
                  Cancelar
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
          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground px-1 py-2">
              Aún no tienes amigos. Busca a alguien por nombre para añadirle.
            </p>
          )}
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => setViewFriend(friend)}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-left"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${friend.name !== 'Patricia' ? 'border-2 border-[#9E9AB3]' : ''} bg-primary/20`}>
                {AVATAR_BY_NAME[friend.name] ? (
                  <img src={AVATAR_BY_NAME[friend.name]} alt={friend.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-semibold text-sm">{friend.name[0]}</span>
                )}
              </div>
              <span className="flex-1 text-foreground text-sm font-medium">{friend.name}</span>
              <div className="flex items-center gap-1.5">
                {SHARING_ROUTE_IDS.has(friend.id) ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-muted-foreground">En ruta</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground">Desconectado</span>
                  </>
                )}
              </div>
            </button>
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
              {friends.map(friend => (
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
                  const friend = friends.find(f => f.id === memberId);
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
              {friends.filter(f => !selectedGroup.members.includes(f.id)).map(friend => (
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
              {friends.every(f => selectedGroup.members.includes(f.id)) && (
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

      {/* Share profile modal */}
      {showShareModal && (
        <div
          className="absolute inset-0 z-[2000] flex flex-col bg-[#0e0a1f]"
          onClick={() => setShowShareModal(false)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} className="w-9 h-9 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm font-semibold tracking-wide">MI CÓDIGO QR</span>
            <div className="w-9" />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 w-full max-w-xs shadow-2xl">
              <div className="relative">
                {qrDataUrl
                  ? <img src={qrDataUrl} alt="QR de perfil" width={220} height={220} className="rounded-lg" />
                  : <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg animate-pulse" />
                }
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-1.5 shadow">
                    <div className="w-10 h-10 rounded-full bg-[#1a0a2e] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[#1a0a2e] font-bold text-lg tracking-wide">
                @{currentUserName.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-12" onClick={e => e.stopPropagation()}>
            <div className="flex gap-3">
              <button
                onClick={handleShareLink}
                className="flex-1 flex flex-col items-center gap-2 bg-white/10 border border-white/10 rounded-2xl py-4"
              >
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-medium">Compartir</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  toast.success('Enlace copiado');
                }}
                className="flex-1 flex flex-col items-center gap-2 bg-white/10 border border-white/10 rounded-2xl py-4"
              >
                <Link className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-medium">Copiar enlace</span>
              </button>
              <button
                onClick={() => {
                  if (qrDataUrl) {
                    const a = document.createElement('a');
                    a.href = qrDataUrl;
                    a.download = 'zenit-qr.png';
                    a.click();
                  }
                }}
                className="flex-1 flex flex-col items-center gap-2 bg-white/10 border border-white/10 rounded-2xl py-4"
              >
                <Download className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-medium">Descargar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friend profile sheet */}
      {viewFriend && !confirmUnfriend && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold">Perfil</h2>
              <button
                onClick={() => setViewFriend(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#9E9AB3] bg-primary/20 flex items-center justify-center">
                {AVATAR_BY_NAME[viewFriend.name] ? (
                  <img src={AVATAR_BY_NAME[viewFriend.name]} alt={viewFriend.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-2xl">{viewFriend.name[0]}</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold text-lg">{viewFriend.name}</p>
                <p className="text-muted-foreground text-sm">@{viewFriend.name.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {SHARING_ROUTE_IDS.has(viewFriend.id) ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm text-muted-foreground">En ruta</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm text-muted-foreground">Desconectado</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setConfirmUnfriend(true)}
              className="w-full flex items-center gap-2 justify-center py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
            >
              <UserMinus className="w-4 h-4" />
              Dejar de ser amigos
            </button>
          </div>
        </div>
      )}

      {/* Confirm unfriend */}
      {confirmUnfriend && viewFriend && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1200] flex items-center justify-center px-6">
          <div className="w-full bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#9E9AB3] bg-primary/20">
                {AVATAR_BY_NAME[viewFriend.name] ? (
                  <img src={AVATAR_BY_NAME[viewFriend.name]} alt={viewFriend.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-bold text-lg flex items-center justify-center h-full">{viewFriend.name[0]}</span>
                )}
              </div>
              <h3 className="text-foreground font-semibold text-base">¿Dejar de seguir a {viewFriend.name}?</h3>
              <p className="text-muted-foreground text-sm">Ya no podréis ver vuestras rutas en el mapa.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUnfriend(false)}
                className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  persistFriends(friends.filter(f => f.id !== viewFriend.id));
                  toast.success(`Has dejado de ser amigo/a de ${viewFriend.name}`);
                  setConfirmUnfriend(false);
                  setViewFriend(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-destructive text-white font-semibold text-sm"
              >
                Confirmar
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
        <button className="flex items-center justify-center text-white w-12 h-12">
          <Users className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Friends;
