import { FC } from 'react';

interface MapGridProps {
  children?: React.ReactNode;
  className?: string;
}

export const MapGrid: FC<MapGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full h-full bg-background zenit-map-grid ${className}`}>
      {children}
    </div>
  );
};
