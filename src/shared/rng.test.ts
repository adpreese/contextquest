import { describe, expect, it } from 'vitest';
import { createSeededRng } from './rng';

describe('createSeededRng', () => {
  it('produces deterministic sequences for the same seed', () => {
    const rngA = createSeededRng('alpha');
    const rngB = createSeededRng('alpha');

    const sequenceA = Array.from({ length: 5 }, () => rngA.next());
    const sequenceB = Array.from({ length: 5 }, () => rngB.next());

    expect(sequenceA).toEqual(sequenceB);
  });

  it('produces different sequences for different seeds', () => {
    const rngA = createSeededRng('alpha');
    const rngB = createSeededRng('bravo');

    const sequenceA = Array.from({ length: 5 }, () => rngA.next());
    const sequenceB = Array.from({ length: 5 }, () => rngB.next());

    expect(sequenceA).not.toEqual(sequenceB);
  });

  it('generates integers within bounds', () => {
    const rng = createSeededRng('bounds');
    const values = Array.from({ length: 10 }, () => rng.nextInt(3, 7));

    values.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThan(7);
    });
  });
});
