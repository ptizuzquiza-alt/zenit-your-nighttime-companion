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
      className="relative w-full cursor-pointer"
      onClick={readOnly ? onClick : undefined}
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="zenit-input pl-12 cursor-pointer"
        onClick={onClick}
      />
    </div>
  );
};
