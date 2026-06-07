import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_FRIENDS, getStoredFriends } from '@/config/contacts';

describe('getStoredFriends', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('falls back to the default friends when storage is empty', () => {
    expect(getStoredFriends()).toEqual([
      { ...DEFAULT_FRIENDS[0], avatar: '/juan.png' },
      { ...DEFAULT_FRIENDS[1], avatar: '/marta.png' },
      { ...DEFAULT_FRIENDS[2], avatar: '/javier.png' },
    ]);
  });

  it('returns the friends saved by Friends.tsx', () => {
    localStorage.setItem('zenit_friends', JSON.stringify([
      { id: 'ana', name: 'Ana' },
      { id: 'javier', name: 'Javier' },
    ]));

    expect(getStoredFriends()).toEqual([
      { id: 'ana', name: 'Ana', avatar: undefined },
      { id: 'javier', name: 'Javier', avatar: '/javier.png' },
    ]);
  });
});