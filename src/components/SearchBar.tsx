import { FC } from 'react';
import { Search } from 'lucide-react';

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
      className="flex items-center gap-2 w-full bg-card backdrop-blur-md rounded-3xl px-4 py-4 cursor-pointer"
      onClick={readOnly ? onClick : undefined}
    >
      <Search className="w-4 h-4 shrink-0" />
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
