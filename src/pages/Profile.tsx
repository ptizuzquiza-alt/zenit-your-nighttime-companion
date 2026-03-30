import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Shield, Bell, ChevronRight, LogOut, Users, ChevronLeft, X, Eye, EyeOff, MapPin } from 'lucide-react';
import { toast } from 'sonner';

type Sheet = 'privacy' | 'notifications' | 'edit' | 'logout' | null;

const Profile: FC = () => {
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);

  // Edit profile state — persisted in localStorage
  const [name, setName] = useState(() => localStorage.getItem('zenit_name') || 'Patricia');
  const [username, setUsername] = useState(() => localStorage.getItem('zenit_username') || '@patricia');
  const [email, setEmail] = useState(() => localStorage.getItem('zenit_email') || 'patricia@email.com');
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Privacy toggles
  const [showLocation, setShowLocation] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);

  // Notification toggles
  const [notifFriends, setNotifFriends] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  const openSheet = (sheet: Sheet) => {
    if (sheet === 'edit') {
      setEditName(name);
      setEditUsername(username);
      setEditEmail(email);
      setEditPassword('');
      setShowPw(false);
    }
    setActiveSheet(sheet);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    const n = editName.trim();
    const u = editUsername.trim();
    const em = editEmail.trim();
    setName(n);
    setUsername(u);
    setEmail(em);
    localStorage.setItem('zenit_name', n);
    localStorage.setItem('zenit_username', u);
    localStorage.setItem('zenit_email', em);
    setActiveSheet(null);
    toast.success('Perfil actualizado');
  };

  const Toggle: FC<{ value: boolean; onChange: () => void }> = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${value ? 'bg-primary justify-end' : 'bg-muted/60 justify-start'}`}
    >
      <span className="w-5 h-5 rounded-full bg-white shadow transition-transform" />
    </button>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background flex flex-col">
      {/* Back button */}
      <div className="pt-12 px-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="pt-4 pb-6 px-6 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
          <User className="w-9 h-9 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-foreground font-semibold text-lg">{name}</h2>
          <p className="text-primary/80 text-sm">{username}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto pb-24">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-1">Cuenta</p>
        {[
          { icon: Shield, label: 'Privacidad y seguridad', sheet: 'privacy' as Sheet },
          { icon: Bell, label: 'Notificaciones', sheet: 'notifications' as Sheet },
          { icon: User, label: 'Editar perfil', sheet: 'edit' as Sheet },
        ].map(({ icon: Icon, label, sheet }) => (
          <button
            key={label}
            onClick={() => openSheet(sheet)}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card border border-border text-left active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => openSheet('logout')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-left active:opacity-70 transition-opacity"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-destructive text-sm">Cerrar sesión</span>
        </button>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-8 z-[1000]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center text-muted-foreground w-12 h-12"
        >
          <Map className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate('/friends')}
          className="flex items-center justify-center text-muted-foreground w-12 h-12"
        >
          <Users className="w-6 h-6" />
        </button>
      </div>

      {/* ── Privacidad sheet ── */}
      {activeSheet === 'privacy' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-foreground font-semibold">Privacidad y seguridad</h2>
              </div>
              <button onClick={() => setActiveSheet(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { icon: MapPin, label: 'Compartir ubicación', desc: 'Tus amigos pueden ver dónde estás', value: showLocation, onChange: () => setShowLocation(v => !v) },
                { icon: Eye, label: 'Perfil visible', desc: 'Cualquier usuario puede encontrarte', value: showProfile, onChange: () => setShowProfile(v => !v) },
                { icon: User, label: 'Compartir actividad', desc: 'Muestra tus rutas recientes', value: shareActivity, onChange: () => setShareActivity(v => !v) },
              ].map(({ icon: Icon, label, desc, value, onChange }) => (
                <div key={label} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border">
                  <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Toggle value={value} onChange={onChange} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Notificaciones sheet ── */}
      {activeSheet === 'notifications' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-foreground font-semibold">Notificaciones</h2>
              </div>
              <button onClick={() => setActiveSheet(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Solicitudes de amistad', desc: 'Cuando alguien te añade como amigo', value: notifFriends, onChange: () => setNotifFriends(v => !v) },
                { label: 'Alertas de zona', desc: 'Avisos de seguridad en tu área', value: notifAlerts, onChange: () => setNotifAlerts(v => !v) },
                { label: 'Novedades de Zenit', desc: 'Actualizaciones y nuevas funciones', value: notifUpdates, onChange: () => setNotifUpdates(v => !v) },
              ].map(({ label, desc, value, onChange }) => (
                <div key={label} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border">
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Toggle value={value} onChange={onChange} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Editar perfil sheet ── */}
      {activeSheet === 'edit' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold">Editar perfil</h2>
              <button onClick={() => setActiveSheet(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
                <User className="w-9 h-9 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Usuario</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Contraseña</label>
                <div className="flex items-center bg-background border border-border rounded-xl px-4 opacity-60 cursor-not-allowed">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value="zenit_pass_2024"
                    readOnly
                    className="flex-1 bg-transparent py-3 text-sm text-foreground outline-none cursor-not-allowed select-none"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-muted-foreground p-1 cursor-pointer">
                    {showPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { toast.success('Email enviado — revisa tu bandeja de entrada'); }}
                  className="text-xs text-primary underline underline-offset-2 mt-1.5 px-1"
                >
                  ¿Has olvidado la contraseña?
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={!editName.trim()}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* ── Cerrar sesión confirm ── */}
      {activeSheet === 'logout' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground font-semibold">Cerrar sesión</h2>
              <button onClick={() => setActiveSheet(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">¿Seguro que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveSheet(null)}
                className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setActiveSheet(null); toast.success('Sesión cerrada'); }}
                className="flex-1 py-3.5 rounded-2xl bg-destructive text-white font-semibold text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
