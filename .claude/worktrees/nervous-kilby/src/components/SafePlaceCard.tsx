import { FC } from 'react';

interface SafePlaceCardProps {
  name?: string;
  onClick?: () => void;
}

export const SafePlaceCard: FC<SafePlaceCardProps> = ({ name, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex-shrink-0 w-28 h-20 rounded-xl bg-zenit-blue/20 border border-zenit-blue/30 flex flex-col items-center justify-center gap-2 hover:bg-zenit-blue/30 transition-colors"
    >
      <div className="w-8 h-1 bg-foreground/40 rounded" />
      <div className="w-12 h-1 bg-foreground/40 rounded" />
      <div className="w-6 h-1 bg-foreground/40 rounded" />
    </button>
  );
};
