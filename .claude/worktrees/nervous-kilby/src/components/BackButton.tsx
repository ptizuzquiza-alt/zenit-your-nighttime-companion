import { FC } from 'react';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
}

export const BackButton: FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center shadow-lg"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </button>
  );
};
