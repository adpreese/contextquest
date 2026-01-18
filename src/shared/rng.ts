export interface SeededRng {
  next: () => number;
  nextInt: (min: number, max: number) => number;
  nextFloat: (min?: number, max?: number) => number;
}

const UINT32_MAX = 0xffffffff;

const hashSeed = (seed: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number): (() => number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / (UINT32_MAX + 1);
  };
};

export const createSeededRng = (seed: string): SeededRng => {
  const base = mulberry32(hashSeed(seed));
  return {
    next: () => base(),
    nextInt: (min: number, max: number) => {
      if (max <= min) {
        throw new Error('max must be greater than min');
      }
      return Math.floor(base() * (max - min)) + min;
    },
    nextFloat: (min = 0, max = 1) => {
      if (max <= min) {
        throw new Error('max must be greater than min');
      }
      return base() * (max - min) + min;
    },
  };
};
