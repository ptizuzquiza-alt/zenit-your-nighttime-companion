import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, User, Shield, Bell, ChevronRight, LogOut, UserPlus, Users } from 'lucide-react';


const Profile: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <div className="pt-14 pb-6 px-6 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40">
          <User className="w-9 h-9 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-foreground font-semibold text-lg">Patricia</h2>
          <p className="text-muted-foreground text-sm">patricia@email.com</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto pb-24">
        {/* Friends section */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-1">Amigos</p>
        {[
          { icon: Users, label: 'Mis amigos', action: () => navigate('/friends') },
          { icon: UserPlus, label: 'Añadir amigos', action: () => navigate('/friends') },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card border border-border text-left"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-foreground text-sm">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-2">Cuenta</p>
        {[
          { icon: Shield, label: 'Privacidad y seguridad' },
          { icon: Bell, label: 'Notificaciones' },
          { icon: User, label: 'Editar perfil' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-card border border-border text-left"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-left">
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
    </div>
  );
};

export default Profile;
