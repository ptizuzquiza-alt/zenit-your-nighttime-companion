import { FC, ReactNode } from 'react';

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
  inactiveClassName = 'bg-popover text-white',
  iconClassName = 'w-7 h-7',
  badgeClassName = 'absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md',
  children,
}) => {
  const stateClasses = active ? activeClassName : inactiveClassName;

  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 424.66 438.93" className={iconClassName} fill="currentColor">
      <path d="M347.22,376.42l-104.77.34c-6.2.02-10.24-6.58-10-11.27.32-6.2,4.88-10.52,11.26-10.54l102.71-.4c32.3-.12,56.76-28.15,56.55-59.3-.21-31.32-25.15-58.54-57.6-58.63l-192.38-.48c-44.06-.11-78.03-36.9-79.08-79.98-1.11-45.46,33.3-83.27,79.07-84.64l20.84.14c6.08.04,9.98,5.67,9.84,11.01s-4.27,10.6-10.31,10.62l-19.4.08c-33.18.13-58.16,27.74-58.09,60.71.08,33.09,25.58,60.28,59.18,60.35l191.35.4c43.7.09,77.69,37.32,78.28,79.52.61,43.1-32.87,80.66-77.43,82.08Z"/>
      <path d="M395.76,53.33c5.52,37.81-27.22,76.12-53.05,102.26-4.03,4.08-10.93,4.5-15.11.35-10.56-10.48-20.2-21.22-29.18-33.1-14.14-18.7-26.12-41.28-24.69-64.85,1.83-30.03,23.92-53.02,53.41-57.4,5.38-.8,10.29-.81,15.69,0,27.79,4.23,48.82,24.58,52.93,52.72ZM334.92,140.5c17.37-18.76,36.79-40.18,43.52-65.23,3.38-13.52,1.78-27.31-5.98-39-8.36-12.58-22.67-19.87-37.49-19.89s-28.78,7.09-37.21,19.37c-7.85,11.43-9.74,25.01-6.64,38.42,6.32,25.26,25.84,46.86,43.8,66.33Z"/>
      <path d="M245.27,93.16h-32.6c-6.23.01-10.9-4.8-11.1-10.62s4.66-11.21,11.11-11.18l33.99.17c6.12.03,9.95,5.85,9.73,11.14-.23,5.58-4.47,10.5-11.12,10.5Z"/>
      <path d="M331,27.84c19.51-2.23,36,11.84,38.22,30.24,2.29,18.99-11.4,36.08-30.1,38.33-18.85,2.27-35.92-11.02-38.41-29.63-2.52-18.86,10.55-36.69,30.29-38.94ZM330.83,44.21c-10.61,2.45-16.27,12.92-13.67,22.67s12.26,15.48,22.05,13.15,16.02-12.17,13.63-22.13c-2.25-9.39-11.62-16.1-22.01-13.69Z"/>
      <path d="M119.6,306.17c0,23.84-19.38,43.17-43.29,43.17s-43.29-19.33-43.29-43.17,19.38-43.17,43.29-43.17,43.29,19.33,43.29,43.17ZM102.2,306.16c0-14.26-11.6-25.83-25.9-25.83s-25.9,11.56-25.9,25.83,11.6,25.83,25.9,25.83,25.9-11.56,25.9-25.83Z"/>
      <path d="M132.48,263.48v17.33c12.06,2.2,21.21,12.69,21.21,25.35s-9.15,23.15-21.21,25.35v17.35c21.68-2.36,38.61-20.46,38.61-42.7s-16.93-40.34-38.61-42.7Z"/>
      <path d="M146.74,438.93h-18.01l.05-23.48c.04-17.08-13.77-30.96-30.86-31l-47.53-.1c-17.51-.04-31.74,14.13-31.78,31.64l-.05,22.94H0v-26.55c0-24.71,20.03-44.73,44.73-44.73h59.4c23.53,0,42.61,19.08,42.61,42.61v28.68Z"/>
      <path d="M156.65,367.85v20.53c13,3.68,22.49,12.27,22.54,29.7l-.05,20.84h18.01v-28.68c0-22.81-17.97-41.27-40.49-42.4Z"/>
    </svg>
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center shadow-lg transition-all ${stateClasses} ${className}`}
    >
      {children ?? defaultIcon}
      {badgeCount > 0 && (
        <span className={badgeClassName}>{badgeCount}</span>
      )}
    </button>
  );
};