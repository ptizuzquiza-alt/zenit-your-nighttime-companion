import { FC } from 'react';
import { MapPin } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const SearchBar: FC<SearchBarProps> = ({
  placeholder = 'Buscar',
  onClick,
  value,
  onChange,
  readOnly = false
}) => {
  return (
    <div
      className="flex items-center gap-2 w-full bg-secondary/90 backdrop-blur-md rounded-xl px-3 py-3 cursor-pointer"
      onClick={readOnly ? onClick : undefined}
    >
      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-4 h-4 text-primary" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none cursor-pointer text-sm"
        onClick={onClick}
      />
    </div>
  );
};
