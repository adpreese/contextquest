import { describe, expect, it } from 'vitest';
import type { Variant } from './types';
import { ModelProvider, VariantType } from './types';
import { selectVariantForTicket } from './variant-selection';

const buildVariants = (): Variant[] => [
  {
    id: 'variant-a',
    name: 'Variant A',
    type: VariantType.Baseline,
    model: {
      id: 'model-a',
      provider: ModelProvider.OpenAI,
      name: 'Model A',
    },
  },
  {
    id: 'variant-b',
    name: 'Variant B',
    type: VariantType.Experimental,
    model: {
      id: 'model-b',
      provider: ModelProvider.OpenAI,
      name: 'Model B',
    },
  },
];

describe('selectVariantForTicket', () => {
  it('selects deterministically for the same seed and ticket', () => {
    const variants = buildVariants();
    const first = selectVariantForTicket('seed-123', 'ticket-42', variants);
    const second = selectVariantForTicket('seed-123', 'ticket-42', variants);

    expect(first).toEqual(second);
  });

  it('requires exactly two variants for MVP selection', () => {
    const variants = buildVariants().slice(0, 1);

    expect(() =>
      selectVariantForTicket('seed-123', 'ticket-42', variants),
    ).toThrow('Expected exactly 2 variants');
  });
});
