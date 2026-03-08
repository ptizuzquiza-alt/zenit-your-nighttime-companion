import { FC } from 'react';

interface FriendActivityCardProps {
  name: string;
  avatar?: string;
  activity: string;
  destination: string;
  address: string;
  time: string;
}

export const FriendActivityCard: FC<FriendActivityCardProps> = ({
  name,
  avatar,
  activity,
  destination,
  address,
  time
}) => {
  return (
    <div className="zenit-friend-activity">
      <p className="text-xs text-muted-foreground mb-2">{time}</p>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">{name[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-foreground">
            <span className="font-semibold text-accent">{name}</span>
            <span className="text-muted-foreground"> {activity}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hacia <span className="text-foreground font-medium">{destination}</span>, en {address}
          </p>
        </div>
      </div>
    </div>
  );
};
