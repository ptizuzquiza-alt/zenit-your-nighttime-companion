import { describe, it, expect } from 'vitest';
import { mapManeuverDirection, backtrackRatio, turnsPerKm, type RouteResult } from '@/lib/routing';

// ─── mapManeuverDirection ────────────────────────────────────────────────────

describe('mapManeuverDirection', () => {
  it('returns left for left-family modifiers', () => {
    expect(mapManeuverDirection('left')).toBe('left');
    expect(mapManeuverDirection('sharp left')).toBe('left');
    expect(mapManeuverDirection('slight left')).toBe('left');
  });

  it('returns right for right-family modifiers', () => {
    expect(mapManeuverDirection('right')).toBe('right');
    expect(mapManeuverDirection('sharp right')).toBe('right');
    expect(mapManeuverDirection('slight right')).toBe('right');
  });

  it('returns straight for non-directional modifiers and undefined', () => {
    expect(mapManeuverDirection(undefined)).toBe('straight');
    expect(mapManeuverDirection('straight')).toBe('straight');
    expect(mapManeuverDirection('uturn')).toBe('straight');
  });
});

// ─── backtrackRatio ──────────────────────────────────────────────────────────

describe('backtrackRatio', () => {
  it('returns 0 for an empty route', () => {
    expect(backtrackRatio([], [41.4, 2.1])).toBe(0);
  });

  it('returns 0 for a single-point route', () => {
    expect(backtrackRatio([[41.4, 2.1]], [41.5, 2.2])).toBe(0);
  });

  it('returns 0 for a direct route that moves steadily toward the destination', () => {
    const coords: [number, number][] = [
      [41.40, 2.10], [41.42, 2.12], [41.44, 2.14], [41.46, 2.16],
    ];
    const dest: [number, number] = [41.46, 2.16];
    expect(backtrackRatio(coords, dest)).toBeCloseTo(0, 5);
  });

  it('returns > 0 when the route detours away from the destination', () => {
    const coords: [number, number][] = [
      [41.40, 2.10], [41.30, 2.00], [41.46, 2.16], // dips south then arrives
    ];
    const dest: [number, number] = [41.46, 2.16];
    expect(backtrackRatio(coords, dest)).toBeGreaterThan(0);
  });

  it('returns a value between 0 and 1', () => {
    const coords: [number, number][] = [
      [41.40, 2.10], [41.38, 2.08], [41.36, 2.06], [41.46, 2.16],
    ];
    const ratio = backtrackRatio(coords, [41.46, 2.16]);
    expect(ratio).toBeGreaterThanOrEqual(0);
    expect(ratio).toBeLessThanOrEqual(1);
  });
});

// ─── turnsPerKm ──────────────────────────────────────────────────────────────

function makeRoute(coords: [number, number][], distanceM = 2000): RouteResult {
  return { coordinates: coords, distance: distanceM, duration: 1000, steps: [] };
}

describe('turnsPerKm', () => {
  it('returns 0 for a perfectly straight diagonal line', () => {
    const coords: [number, number][] = [
      [41.40, 2.10], [41.41, 2.11], [41.42, 2.12], [41.43, 2.13],
    ];
    expect(turnsPerKm(makeRoute(coords))).toBe(0);
  });

  it('returns a positive value for an L-shaped route', () => {
    // North then East — one 90° turn
    const coords: [number, number][] = [
      [41.40, 2.10], [41.41, 2.10], [41.41, 2.11], [41.42, 2.11],
    ];
    expect(turnsPerKm(makeRoute(coords))).toBeGreaterThan(0);
  });

  it('returns 0 when distance is 0 (avoids division by zero)', () => {
    const coords: [number, number][] = [
      [41.40, 2.10], [41.41, 2.10], [41.41, 2.11],
    ];
    expect(turnsPerKm(makeRoute(coords, 0))).toBe(0);
  });

  it('returns fewer turns/km for an avenue than for a winding alley', () => {
    const avenue: [number, number][] = [
      [41.40, 2.10], [41.41, 2.11], [41.42, 2.12], [41.43, 2.13],
    ];
    const alley: [number, number][] = [
      [41.40, 2.10], [41.401, 2.10], [41.401, 2.101],
      [41.402, 2.101], [41.402, 2.102], [41.403, 2.102],
    ];
    expect(turnsPerKm(makeRoute(avenue))).toBeLessThan(turnsPerKm(makeRoute(alley)));
  });
});
