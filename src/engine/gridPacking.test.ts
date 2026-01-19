import { describe, expect, it } from 'vitest';
import { packContextGrid } from './gridPacking';

describe('packContextGrid', () => {
  it('packs blocks without overlaps inside bounds', () => {
    const result = packContextGrid(
      { rows: 2, columns: 4 },
      [
        { id: 'block-a', width: 2, height: 1, fidelity: 1, noise: 0 },
        { id: 'block-b', width: 2, height: 1, fidelity: 1, noise: 0 },
        { id: 'block-c', width: 2, height: 1, fidelity: 1, noise: 0 },
      ],
    );

    expect(result.overflow).toHaveLength(0);
    expect(result.placements).toMatchObject({
      'block-a': { row: 0, column: 0 },
      'block-b': { row: 0, column: 2 },
      'block-c': { row: 1, column: 0 },
    });
  });

  it('skips blocks that cannot fit within grid bounds', () => {
    const result = packContextGrid(
      { rows: 2, columns: 2 },
      [{ id: 'block-a', width: 3, height: 1, fidelity: 1, noise: 0 }],
    );

    expect(result.placements).toEqual({});
    expect(result.overflow).toEqual(['block-a']);
  });

  it('applies compression to size, fidelity, and noise', () => {
    const result = packContextGrid(
      { rows: 2, columns: 2 },
      [
        {
          id: 'block-a',
          width: 3,
          height: 3,
          fidelity: 0.9,
          noise: 0.1,
        },
      ],
      {
        enabled: true,
        sizeScale: 0.5,
        fidelityLoss: 0.2,
        noiseIncrease: 0.3,
      },
    );

    expect(result.overflow).toHaveLength(0);
    expect(result.packedBlocks[0]).toMatchObject({
      effectiveWidth: 2,
      effectiveHeight: 2,
      fidelity: 0.7,
      noise: 0.4,
      compressed: true,
    });
  });
});
