import { FC, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Shield, Bell, ChevronRight, LogOut, Users, ChevronLeft, X, Eye, EyeOff, MapPin, Home, Briefcase, Star, Plus, Trash2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AVATAR_BY_NAME } from '@/config/contacts';
import { useAuth, DEMO_EMAIL } from '@/contexts/AuthContext';
import { SavedPlace, getSavedPlaces } from '@/pages/MapSearch';
import { searchPlaces, GeocodingResult } from '@/lib/geocoding';
import { resetTutorials } from '@/lib/tutorials';

type Sheet = 'privacy' | 'notifications' | 'edit' | 'logout' | 'places' | null;

const Profile: FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, uploadAvatar } = useAuth();
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);

  // Edit profile state — reads from auth user/profile when available, falls back to localStorage (demo)
  const [name, setName] = useState(() => profile?.name ?? localStorage.getItem('zenit_name') ?? 'Patricia');
  const [username, setUsername] = useState(() => profile?.username ? `@${profile.username}` : (localStorage.getItem('zenit_username') ?? '@patricia'));
  const [email, setEmail] = useState(() => user?.email ?? localStorage.getItem('zenit_email') ?? 'patricia@email.com');
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync displayed values when auth profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUsername(`@${profile.username}`);
      if (profile.avatar_url) setProfilePhoto(profile.avatar_url);
    }
  }, [profile]);

  // Sync email from the authenticated session — source of truth for the account email
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      localStorage.setItem('zenit_email', user.email);
    }
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem('zenit_photo');
    if (stored && !profile?.avatar_url) {
      setProfilePhoto(stored);
    }
  }, [profile]);
  const [showPw, setShowPw] = useState(false);

  const DEMO_PLACES: SavedPlace[] = [
    { id: 'demo-casa', label: 'Casa', name: 'Carrer de Provença 321, Barcelona', address: 'Eixample, Barcelona', lat: 41.3963, lon: 2.1607, icon: 'home' },
    { id: 'demo-trabajo', label: 'Trabajo', name: 'Passeig de Gràcia 92, Barcelona', address: 'Eixample, Barcelona', lat: 41.3952, lon: 2.1617, icon: 'work' },
  ];

  const seedDemoPlaces = () => {
    localStorage.setItem('zenit_saved_places', JSON.stringify(DEMO_PLACES));
    setSavedPlaces(DEMO_PLACES);
  };

  // Saved places
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => getSavedPlaces());

  // Seed demo places when user loads (covers Vercel/Supabase session)
  useEffect(() => {
    if (savedPlaces.length > 0) return;
    const isDemo = user?.email === DEMO_EMAIL || localStorage.getItem('zenit_name') === 'Maya';
    if (isDemo) seedDemoPlaces();
  }, [user]);
  const [addingPlace, setAddingPlace] = useState(false);
  const [newPlaceLabel, setNewPlaceLabel] = useState('');
  const [newPlaceIcon, setNewPlaceIcon] = useState<SavedPlace['icon']>('star');
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeResults, setPlaceResults] = useState<GeocodingResult[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [confirmDeletePlace, setConfirmDeletePlace] = useState<string | null>(null);

  const savePlaces = (updated: SavedPlace[]) => {
    setSavedPlaces(updated);
    localStorage.setItem('zenit_saved_places', JSON.stringify(updated));
  };

  const handleDeletePlace = (id: string) => {
    setConfirmDeletePlace(id);
  };

  const confirmDelete = () => {
    if (!confirmDeletePlace) return;
    savePlaces(savedPlaces.filter(p => p.id !== confirmDeletePlace));
    setConfirmDeletePlace(null);
  };

  const handleAddPlace = (result: GeocodingResult) => {
    if (!newPlaceLabel.trim()) return;
    const newPlace: SavedPlace = {
      id: Date.now().toString(),
      label: newPlaceLabel.trim(),
      name: result.name,
      address: result.address ?? '',
      lat: result.lat,
      lon: result.lon,
      icon: newPlaceIcon,
    };
    savePlaces([...savedPlaces, newPlace]);
    setAddingPlace(false);
    setNewPlaceLabel('');
    setPlaceSearch('');
    setPlaceResults([]);
    toast.success(`"${newPlace.label}" guardado`);
  };

  useEffect(() => {
    if (!addingPlace || placeSearch.length < 2) { setPlaceResults([]); return; }
    setPlaceSearchLoading(true);
    const t = setTimeout(() => {
      searchPlaces(placeSearch).then(res => { setPlaceResults(res); setPlaceSearchLoading(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [placeSearch, addingPlace]);

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

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    const n = editName.trim();
    const u = editUsername.trim().replace(/^@/, '');
    const em = editEmail.trim();

    if (user) {
      const { error } = await updateProfile({ name: n, username: u });
      if (error) { toast.error('Error al guardar: ' + error); return; }
    } else {
      // Demo mode — localStorage only
      localStorage.setItem('zenit_name', n);
      localStorage.setItem('zenit_username', editUsername.trim());
      localStorage.setItem('zenit_email', em);
    }

    setName(n);
    setUsername(u ? `@${u}` : editUsername.trim());
    setEmail(em);
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (user) {
      setUploadingPhoto(true);
      const { url, error } = await uploadAvatar(file);
      setUploadingPhoto(false);
      if (error) { toast.error('Error al subir la foto: ' + error); return; }
      if (url) {
        setProfilePhoto(url);
        localStorage.setItem('zenit_photo', url);
        toast.success('Foto actualizada');
      }
    } else {
      // Demo mode — base64 in localStorage
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem('zenit_photo', result);
        toast.success('Foto actualizada');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
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
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 overflow-hidden">
          {profilePhoto || AVATAR_BY_NAME[name] ? (
            <img
              src={profilePhoto || AVATAR_BY_NAME[name] || ''}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-9 h-9 text-primary" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-foreground font-semibold text-lg">{name}</h2>
          <p className="text-primary/80 text-sm">{username}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 min-h-0 px-4 space-y-2 overflow-y-auto pb-28">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-1">Cuenta</p>
        {[
          { icon: Shield, label: 'Privacidad y seguridad', sheet: 'privacy' as Sheet },
          { icon: Bell, label: 'Notificaciones', sheet: 'notifications' as Sheet },
          { icon: User, label: 'Editar perfil', sheet: 'edit' as Sheet },
          { icon: MapPin, label: 'Lugares guardados', sheet: 'places' as Sheet },
        ].map(({ icon: Icon, label, sheet }) => (
          <button
            key={label}
            onClick={() => openSheet(sheet)}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card border border-border text-left active:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-base">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => {
            resetTutorials();
            toast.success('Los tutoriales volverán a mostrarse');
          }}
          className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card border border-border text-left active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground text-sm">Más de Zenit</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => openSheet('logout')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-left active:opacity-70 transition-opacity"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-destructive text-sm">Cerrar sesión</span>
        </button>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border flex items-start justify-around px-8 z-[1000]" style={{ paddingTop: "0.875rem", paddingBottom: "env(safe-area-inset-bottom, 1.25rem)", minHeight: "4.5rem" }}>
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground w-14"
        >
          <Map className="w-6 h-6" />
          <span className="text-[11px] font-medium">Mapa</span>
        </button>
        <button
          onClick={() => navigate('/friends')}
          className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground w-14"
        >
          <Users className="w-6 h-6" />
          <span className="text-[11px] font-medium">Amigos</span>
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
                    <p className="text-base text-foreground font-medium">{label}</p>
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
                    <p className="text-base text-foreground font-medium">{label}</p>
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
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 overflow-hidden relative"
              >
                {profilePhoto || AVATAR_BY_NAME[name] ? (
                  <img
                    src={profilePhoto || AVATAR_BY_NAME[name] || ''}
                    alt={name}
                    className={`w-full h-full object-cover transition-opacity ${uploadingPhoto ? 'opacity-40' : ''}`}
                  />
                ) : (
                  <User className="w-9 h-9 text-primary" />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="text-xs text-primary font-medium underline underline-offset-2 disabled:opacity-50"
              >
                {uploadingPhoto ? 'Subiendo...' : 'Editar foto'}
              </button>
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
                onClick={async () => {
                  if (user) {
                    await signOut();
                  } else {
                    localStorage.removeItem('zenit_onboarded');
                  }
                  navigate('/onboarding', { replace: true });
                }}
                className="flex-1 py-3.5 rounded-2xl bg-destructive text-white font-semibold text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lugares guardados sheet ── */}
      {activeSheet === 'places' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1100] flex items-end">
          <div className="w-full bg-card border-t border-border rounded-t-3xl px-5 pt-5 pb-10" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-foreground font-semibold">Lugares guardados</h2>
              </div>
              <button onClick={() => { setActiveSheet(null); setAddingPlace(false); setPlaceSearch(''); setPlaceResults([]); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* List of saved places */}
            <div className="space-y-2 mb-4">
              {savedPlaces.length === 0 && !addingPlace && (
                <p className="text-sm text-muted-foreground text-center py-4">No tienes lugares guardados aún.</p>
              )}
              {savedPlaces.map(place => {
                const Icon = place.icon === 'home' ? Home : place.icon === 'work' ? Briefcase : Star;
                const isConfirming = confirmDeletePlace === place.id;
                return (
                  <div key={place.id} className="rounded-xl bg-secondary/40 overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{place.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.name}</p>
                      </div>
                      <button
                        onClick={() => setConfirmDeletePlace(isConfirming ? null : place.id)}
                        className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    {isConfirming && (
                      <div className="flex gap-2 px-3 pb-3">
                        <button
                          onClick={() => setConfirmDeletePlace(null)}
                          className="flex-1 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium"
                        >
                          No
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-medium"
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new place */}
            {!addingPlace ? (
              <button
                onClick={() => setAddingPlace(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:bg-secondary/30 transition-colors"
              >
                <Plus className="w-4 h-4" /> Añadir lugar
              </button>
            ) : (
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-sm font-medium text-foreground">Nuevo lugar</p>

                {/* Label */}
                <input
                  type="text"
                  placeholder="Nombre (ej: Casa, Trabajo…)"
                  value={newPlaceLabel}
                  onChange={e => setNewPlaceLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                {/* Icon picker */}
                <div className="flex gap-2">
                  {(['home', 'work', 'star'] as const).map(ico => {
                    const Icon = ico === 'home' ? Home : ico === 'work' ? Briefcase : Star;
                    return (
                      <button
                        key={ico}
                        onClick={() => setNewPlaceIcon(ico)}
                        className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-medium transition-colors ${newPlaceIcon === ico ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-secondary/40 text-muted-foreground'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {ico === 'home' ? 'Casa' : ico === 'work' ? 'Trabajo' : 'Otro'}
                      </button>
                    );
                  })}
                </div>

                {/* Location search */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/60">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar dirección…"
                    value={placeSearch}
                    onChange={e => setPlaceSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                {placeSearchLoading && <p className="text-xs text-muted-foreground">Buscando…</p>}
                {placeResults.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {placeResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleAddPlace(r)}
                        className="w-full text-left px-3 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.address}</p>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { setAddingPlace(false); setPlaceSearch(''); setPlaceResults([]); setNewPlaceLabel(''); }}
                  className="w-full py-2 text-sm text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
