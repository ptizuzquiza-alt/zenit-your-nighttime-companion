export interface FriendContact {
  id: string;
  name: string;
  avatar?: string;
}

// IDs of friends currently broadcasting an active route
export const SHARING_ROUTE_IDS = new Set(['juan', 'marta']);

export const DEFAULT_FRIENDS: FriendContact[] = [
  { id: 'juan', name: 'Juan' },
  { id: 'marta', name: 'Marta' },
  { id: 'javier', name: 'Javier' },
];

export const AVATAR_BY_NAME: Record<string, string> = {
  Juan: '/juan.png',
  Marta: '/marta.png',
  Carla: '/carla.png',
  Javier: '/javier.png',
  Patricia: '/patricia.png',
};

const FRIENDS_STORAGE_KEY = 'zenit_friends';

const withAvatar = (friend: FriendContact): FriendContact => ({
  ...friend,
  avatar: friend.avatar ?? AVATAR_BY_NAME[friend.name],
});

export const getStoredFriends = (): FriendContact[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_FRIENDS.map(withAvatar);
  }

  const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
  if (stored === null) {
    return DEFAULT_FRIENDS.map(withAvatar);
  }

  try {
    const parsed = JSON.parse(stored) as Array<{ id: string; name: string; avatar?: string }>;
    if (!Array.isArray(parsed)) {
      return DEFAULT_FRIENDS.map(withAvatar);
    }
    return parsed.map(withAvatar);
  } catch {
    return DEFAULT_FRIENDS.map(withAvatar);
  }
};
