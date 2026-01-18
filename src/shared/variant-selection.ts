import type { Variant } from './types';
import { createSeededRng } from './rng';

const EXPECTED_VARIANT_COUNT = 2;

export const selectVariantForTicket = (
  seed: string,
  ticketId: string,
  variants: Variant[],
): Variant => {
  if (variants.length !== EXPECTED_VARIANT_COUNT) {
    throw new Error(
      `Expected exactly ${EXPECTED_VARIANT_COUNT} variants, received ${variants.length}`,
    );
  }

  const rng = createSeededRng(`${seed}:${ticketId}`);
  const index = rng.nextInt(0, variants.length);
  return variants[index];
};
