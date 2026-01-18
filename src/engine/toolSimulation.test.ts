import { describe, expect, it } from 'vitest';
import type { ToolDefinition } from '../shared/types';
import { simulateToolInvocation } from './toolSimulation';

const domSnapshotTool: ToolDefinition = {
  id: 'tool-dom',
  name: 'domSnapshot',
  description: 'Capture a DOM snapshot.',
  outputSchema: {
    type: 'object',
    properties: {},
  },
};

describe('simulateToolInvocation', () => {
  it('returns deterministic output for the same seed and input', () => {
    const input = { viewportWidth: 1440, viewportHeight: 900 };
    const first = simulateToolInvocation({
      tool: domSnapshotTool,
      input,
      seed: 'seed-1',
    });
    const second = simulateToolInvocation({
      tool: domSnapshotTool,
      input,
      seed: 'seed-1',
    });

    expect(first).toEqual(second);
  });

  it('creates evidence blocks for inventory', () => {
    const event = simulateToolInvocation({
      tool: domSnapshotTool,
      input: { viewportWidth: 1024, viewportHeight: 768 },
      seed: 'seed-2',
    });

    expect(event.evidenceBlocks).toHaveLength(1);
    expect(event.evidenceBlocks[0].type).toBe('tool');
  });
});
