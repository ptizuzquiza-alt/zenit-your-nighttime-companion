import { FC } from 'react';
import { Navigation, Map } from 'lucide-react';

interface NavigationFabProps {
  mode: 'navigate' | 'map';
  onClick?: () => void;
}

export const NavigationFab: FC<NavigationFabProps> = ({ mode, onClick }) => {
  return (
    <button onClick={onClick} className="zenit-fab text-primary-foreground">
      {mode === 'navigate' ? <Navigation className="w-6 h-6" /> : <Map className="w-6 h-6" />}
    </button>
  );
};