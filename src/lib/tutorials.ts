const TUTORIAL_STORAGE_KEY = 'zenit_tutorials_seen';

export const TUTORIAL_IDS = [
  'mapSearch',
  'mapFriends',
  'routeZenit',
  'shareRoute',
  'friendsAdd',
  'friendsSharing',
  'navigationEnd',
] as const;

export type TutorialId = typeof TUTORIAL_IDS[number];

export type TutorialStatus = Record<TutorialId, boolean>;

const createDefaultStatus = (): TutorialStatus =>
  Object.fromEntries(TUTORIAL_IDS.map((id) => [id, false])) as TutorialStatus;

const readStatus = (): TutorialStatus => {
  if (typeof window === 'undefined') {
    return createDefaultStatus();
  }

  const raw = localStorage.getItem(TUTORIAL_STORAGE_KEY);
  if (!raw) {
    return createDefaultStatus();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TutorialStatus>;
    return {
      ...createDefaultStatus(),
      ...parsed,
    };
  } catch {
    return createDefaultStatus();
  }
};

const writeStatus = (status: TutorialStatus) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(status));
};

export const getTutorialStatus = () => readStatus();

export const isTutorialSeen = (id: TutorialId) => readStatus()[id];

export const markTutorialSeen = (id: TutorialId) => {
  const next = readStatus();
  next[id] = true;
  writeStatus(next);
};

const FRIENDS_STORAGE_KEY = 'zenit_friends';

export const shouldAutoCompleteShareRouteTutorial = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

export const resetTutorials = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
};