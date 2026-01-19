import { describe, expect, it } from 'vitest';
import type { ContextBlock, ToolDefinition } from '../shared/types';
import { ContextBlockType } from '../shared/types';
import { reduceEngineState } from './reducer';
import { createInitialState } from './state';
import { simulateToolInvocation } from './toolSimulation';

describe('reduceEngineState', () => {
  it('selects a ticket and emits an event', () => {
    const initial = createInitialState();
    const { state, events } = reduceEngineState(initial, {
      type: 'select_ticket',
      ticketId: 'ticket-1',
      timestamp: '2026-01-18T00:00:00Z',
    });

    expect(state.selectedTicketId).toBe('ticket-1');
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('ticket_selected');
  });

  it('places and removes a block', () => {
    const initial = createInitialState();
    const block: ContextBlock = {
      id: 'block-1',
      type: ContextBlockType.Narrative,
      content: 'Hello',
      width: 1,
      height: 1,
      fidelity: 1,
      noise: 0,
    };

    const placed = reduceEngineState(initial, {
      type: 'place_block',
      block,
      position: { row: 0, column: 1 },
    });
    expect(placed.state.blocks).toHaveLength(initial.blocks.length + 1);

    const removed = reduceEngineState(placed.state, {
      type: 'remove_block',
      blockId: 'block-1',
    });
    expect(removed.state.blocks).toHaveLength(initial.blocks.length);
  });

  it('invokes a tool and stores evidence blocks', () => {
    const initial = createInitialState();
    const tool: ToolDefinition = {
      id: 'tool-test',
      name: 'test',
      outputSchema: {
        type: 'object',
        properties: {},
      },
    };
    const toolEvent = simulateToolInvocation({
      tool,
      input: { suite: 'unit' },
      seed: 'seed-3',
    });

    const { state, events } = reduceEngineState(initial, {
      type: 'invoke_tool',
      toolEvent,
      timestamp: '2026-01-18T00:00:00Z',
    });

    expect(state.blocks).toHaveLength(initial.blocks.length + 1);
    expect(events[0].type).toBe('tool_invoked');
  });
});
