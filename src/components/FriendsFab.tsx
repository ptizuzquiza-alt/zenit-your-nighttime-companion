import { FC, ReactNode } from 'react';
import { Users } from 'lucide-react';

interface FriendsFabProps {
  active?: boolean;
  badgeCount?: number;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  iconClassName?: string;
  badgeClassName?: string;
  children?: ReactNode;
}

export const FriendsFab: FC<FriendsFabProps> = ({
  active = false,
  badgeCount = 0,
  onClick,
  ariaLabel = 'Amigos',
  className = '',
  activeClassName = 'bg-primary text-primary-foreground',
  inactiveClassName = 'bg-card/90 text-muted-foreground border border-border',
  iconClassName = 'w-7 h-7',
  badgeClassName = 'absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md',
  children,
}) => {
  const stateClasses = active ? activeClassName : inactiveClassName;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center shadow-lg transition-all ${stateClasses} ${className}`}
    >
      {children ?? <Users className={iconClassName} />}
      {badgeCount > 0 && (
        <span className={badgeClassName}>{badgeCount}</span>
      )}
    </button>
  );
};