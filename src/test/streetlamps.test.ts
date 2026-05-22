import { describe, it, expect } from 'vitest';
import { scoreLighting, getBoundingBox, type StreetLamp } from '@/lib/streetlamps';

describe('scoreLighting', () => {
  it('returns 0 when lamp list is empty', () => {
    const coords: [number, number][] = [[41.4, 2.1], [41.41, 2.11]];
    expect(scoreLighting(coords, [])).toBe(0);
  });

  it('returns 0 when coordinate list is empty', () => {
    const lamps: StreetLamp[] = [{ lat: 41.4, lon: 2.1 }];
    expect(scoreLighting([], lamps)).toBe(0);
  });

  it('returns 1 when every route point has a lamp within 30 m', () => {
    const coords: [number, number][] = [[41.4, 2.1], [41.41, 2.11]];
    // Lamps placed exactly on the route points
    const lamps: StreetLamp[] = [{ lat: 41.4, lon: 2.1 }, { lat: 41.41, lon: 2.11 }];
    expect(scoreLighting(coords, lamps)).toBe(1);
  });

  it('returns 0 when all lamps are far from the route', () => {
    const coords: [number, number][] = [[41.4, 2.1]];
    const lamps: StreetLamp[] = [{ lat: 42.0, lon: 3.0 }]; // ~130 km away
    expect(scoreLighting(coords, lamps)).toBe(0);
  });

  it('returns a value between 0 and 1 for partial coverage', () => {
    // First point is lit, second is far from any lamp
    const coords: [number, number][] = [[41.4, 2.1], [41.5, 2.5]];
    const lamps: StreetLamp[] = [{ lat: 41.4, lon: 2.1 }];
    const score = scoreLighting(coords, lamps);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('counts each route point at most once even with multiple nearby lamps', () => {
    const coords: [number, number][] = [[41.4, 2.1]];
    // Two lamps right next to the same point
    const lamps: StreetLamp[] = [
      { lat: 41.4, lon: 2.1 },
      { lat: 41.40001, lon: 2.10001 },
    ];
    expect(scoreLighting(coords, lamps)).toBe(1);
  });
});

describe('getBoundingBox', () => {
  it('returns bounds padded by 0.003 deg for a single route', () => {
    const coords: [number, number][] = [[41.4, 2.1], [41.5, 2.2]];
    const bb = getBoundingBox([coords]);
    expect(bb.minLat).toBeCloseTo(41.4 - 0.003, 5);
    expect(bb.maxLat).toBeCloseTo(41.5 + 0.003, 5);
    expect(bb.minLon).toBeCloseTo(2.1 - 0.003, 5);
    expect(bb.maxLon).toBeCloseTo(2.2 + 0.003, 5);
  });

  it('spans the full extent across multiple routes', () => {
    const route1: [number, number][] = [[41.4, 2.1], [41.45, 2.15]];
    const route2: [number, number][] = [[41.5, 2.2], [41.55, 2.25]];
    const bb = getBoundingBox([route1, route2]);
    expect(bb.minLat).toBeCloseTo(41.4 - 0.003, 5);
    expect(bb.maxLat).toBeCloseTo(41.55 + 0.003, 5);
    expect(bb.minLon).toBeCloseTo(2.1 - 0.003, 5);
    expect(bb.maxLon).toBeCloseTo(2.25 + 0.003, 5);
  });

  it('respects custom padding', () => {
    const coords: [number, number][] = [[41.4, 2.1]];
    const bb = getBoundingBox([coords], 0.01);
    expect(bb.minLat).toBeCloseTo(41.4 - 0.01, 5);
    expect(bb.maxLat).toBeCloseTo(41.4 + 0.01, 5);
  });
});
