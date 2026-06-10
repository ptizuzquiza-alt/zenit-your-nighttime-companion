import { beforeEach, describe, expect, it } from 'vitest';
import { isTutorialSeen, markTutorialSeen, resetTutorials } from '@/lib/tutorials';

describe('tutorial storage', () => {
  beforeEach(() => {
    resetTutorials();
  });

  it('tracks each tutorial independently and resets all of them', () => {
    expect(isTutorialSeen('mapSearch')).toBe(false);
    expect(isTutorialSeen('routeZenit')).toBe(false);

    markTutorialSeen('mapSearch');

    expect(isTutorialSeen('mapSearch')).toBe(true);
    expect(isTutorialSeen('routeZenit')).toBe(false);

    resetTutorials();

    expect(isTutorialSeen('mapSearch')).toBe(false);
    expect(isTutorialSeen('routeZenit')).toBe(false);
  });
});