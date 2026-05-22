import { describe, it, expect } from 'vitest';
import { scoreLighting } from '@/lib/streetlamps';
import { mapManeuverDirection } from '@/lib/routing';

describe('smoke tests', () => {
  it('scoreLighting returns 0 with no lamps', () => {
    expect(scoreLighting([[41.4, 2.1]], [])).toBe(0);
  });

  it('mapManeuverDirection handles undefined gracefully', () => {
    expect(mapManeuverDirection(undefined)).toBe('straight');
  });
});
