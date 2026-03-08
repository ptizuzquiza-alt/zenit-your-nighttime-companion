import { FC } from 'react';
import { MapPin, Clock } from 'lucide-react';

interface SearchSuggestionProps {
  name: string;
  address: string;
  distance: string;
  isRecent?: boolean;
  onClick?: () => void;
}

export const SearchSuggestion: FC<SearchSuggestionProps> = ({
  name,
  address,
  distance,
  isRecent = false,
  onClick
}) => {
  return (
    <button onClick={onClick} className="zenit-search-item w-full text-left">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
          {isRecent ? (
            <Clock className="w-5 h-5 text-muted-foreground" />
          ) : (
            <MapPin className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{name}</p>
          <p className="text-sm text-muted-foreground truncate">{address}</p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{distance}</span>
      </div>
    </button>
  );
};
