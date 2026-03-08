import { FC } from 'react';
import { Navigation, Map } from 'lucide-react';

interface NavigationFabProps {
  mode: 'navigate' | 'map';
  onClick?: () => void;
}

export const NavigationFab: FC<NavigationFabProps> = ({ mode, onClick }) => {
  return (
    <button onClick={onClick} className="zenit-fab">
      {mode === 'navigate' ? (
        <Navigation className="w-6 h-6 text-white" />
      ) : (
        <Map className="w-6 h-6 text-white" />
      )}
    </button>
  );
};
