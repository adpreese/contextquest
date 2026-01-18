import type { GridPosition } from './state';

export interface GridDimensions {
  rows: number;
  columns: number;
}

export interface GridBlock {
  id: string;
  width: number;
  height: number;
  fidelity?: number;
  noise?: number;
}

export interface CompressionOptions {
  enabled?: boolean;
  sizeScale?: number;
  fidelityLoss?: number;
  noiseIncrease?: number;
}

export interface PackedBlock extends GridBlock {
  position?: GridPosition;
  effectiveWidth: number;
  effectiveHeight: number;
  compressed: boolean;
}

export interface PackResult {
  placements: Record<string, GridPosition>;
  packedBlocks: PackedBlock[];
  overflow: string[];
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const applyCompression = (
  block: GridBlock,
  options?: CompressionOptions,
): PackedBlock => {
  const baseFidelity = clamp(block.fidelity ?? 1, 0, 1);
  const baseNoise = clamp(block.noise ?? 0, 0, 1);

  if (!options?.enabled) {
    return {
      ...block,
      fidelity: baseFidelity,
      noise: baseNoise,
      effectiveWidth: block.width,
      effectiveHeight: block.height,
      compressed: false,
    };
  }

  const scale = clamp(options.sizeScale ?? 1, 0.1, 1);
  const fidelityLoss = clamp(options.fidelityLoss ?? 0, 0, 1);
  const noiseIncrease = clamp(options.noiseIncrease ?? 0, 0, 1);

  return {
    ...block,
    fidelity: clamp(baseFidelity - fidelityLoss, 0, 1),
    noise: clamp(baseNoise + noiseIncrease, 0, 1),
    effectiveWidth: Math.max(1, Math.round(block.width * scale)),
    effectiveHeight: Math.max(1, Math.round(block.height * scale)),
    compressed: true,
  };
};

const canPlace = (
  occupancy: (string | null)[][],
  row: number,
  column: number,
  width: number,
  height: number,
): boolean => {
  if (row + height > occupancy.length) {
    return false;
  }
  if (column + width > occupancy[0].length) {
    return false;
  }

  for (let r = row; r < row + height; r += 1) {
    for (let c = column; c < column + width; c += 1) {
      if (occupancy[r][c]) {
        return false;
      }
    }
  }
  return true;
};

const applyPlacement = (
  occupancy: (string | null)[][],
  blockId: string,
  row: number,
  column: number,
  width: number,
  height: number,
): void => {
  for (let r = row; r < row + height; r += 1) {
    for (let c = column; c < column + width; c += 1) {
      occupancy[r][c] = blockId;
    }
  }
};

export const packContextGrid = (
  dimensions: GridDimensions,
  blocks: GridBlock[],
  compression?: CompressionOptions,
): PackResult => {
  const placements: Record<string, GridPosition> = {};
  const packedBlocks: PackedBlock[] = [];
  const overflow: string[] = [];

  if (dimensions.rows <= 0 || dimensions.columns <= 0) {
    return {
      placements,
      packedBlocks: blocks.map((block) => applyCompression(block, compression)),
      overflow: blocks.map((block) => block.id),
    };
  }

  const occupancy = Array.from({ length: dimensions.rows }, () =>
    Array.from({ length: dimensions.columns }, () => null as string | null),
  );

  for (const block of blocks) {
    const packed = applyCompression(block, compression);
    let placed = false;

    if (
      packed.effectiveWidth <= dimensions.columns &&
      packed.effectiveHeight <= dimensions.rows
    ) {
      for (let row = 0; row < dimensions.rows && !placed; row += 1) {
        for (let column = 0; column < dimensions.columns; column += 1) {
          if (
            canPlace(
              occupancy,
              row,
              column,
              packed.effectiveWidth,
              packed.effectiveHeight,
            )
          ) {
            applyPlacement(
              occupancy,
              packed.id,
              row,
              column,
              packed.effectiveWidth,
              packed.effectiveHeight,
            );
            placements[packed.id] = { row, column };
            packed.position = { row, column };
            placed = true;
            break;
          }
        }
      }
    }

    if (!placed) {
      overflow.push(packed.id);
    }

    packedBlocks.push(packed);
  }

  return { placements, packedBlocks, overflow };
};
