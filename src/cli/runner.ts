import type { EngineEvent, ModelSpec } from '../shared/types';
import { ContextBlockType, ModelProvider } from '../shared/types';
import type { EngineAction } from '../engine/actions';
import { reduceEngineState } from '../engine/reducer';
import { createInitialState } from '../engine/state';
import type { ContextBlock } from '../shared/types';
import type { EngineState } from '../engine/state';

const parseTimestamp = (token?: string): string => {
  if (!token) {
    return '';
  }
  if (/^\d+$/.test(token)) {
    return new Date(Number(token)).toISOString();
  }
  return token;
};

const parseBlockType = (token: string): ContextBlockType => {
  const normalized = token.toLowerCase();
  const match = Object.values(ContextBlockType).find(
    (value) => value.toLowerCase() === normalized,
  );
  return match ?? ContextBlockType.Reference;
};

const buildModelSpec = (id: string): ModelSpec => ({
  id,
  name: id,
  provider: ModelProvider.Custom,
});

export type CliResult =
  | {
      ok: true;
      command: string;
      state: EngineState;
      events: EngineEvent[];
    }
  | {
      ok: false;
      command: string;
      error: string;
    };

export interface CliRunnerOptions {
  jsonOnly?: boolean;
  log?: (message: string) => void;
}

export const createCliRunner = ({ jsonOnly, log }: CliRunnerOptions = {}) => {
  let state = createInitialState();
  let blockCounter = 0;

  const logger = (message: string) => {
    if (jsonOnly) {
      return;
    }
    log?.(message);
  };

  const applyAction = (command: string, action: EngineAction): CliResult => {
    const { state: nextState, events } = reduceEngineState(state, action);
    state = nextState;
    logger(`[cli] ${command} -> ${events.length} event(s)`);
    return { ok: true, command, state: nextState, events };
  };

  const handleLine = (rawLine: string): CliResult | null => {
    const line = rawLine.trim();
    if (!line) {
      return null;
    }

    const [command, ...args] = line.split(/\s+/);

    switch (command) {
      case 'state':
        logger('[cli] state requested');
        return { ok: true, command: line, state, events: [] };
      case 'tick': {
        const timestamp = parseTimestamp(args[0]);
        return applyAction(line, { type: 'tick', timestamp });
      }
      case 'ticket': {
        if (args[0] !== 'select') {
          return { ok: false, command: line, error: 'Unknown ticket command.' };
        }
        const ticketId = args[1];
        if (!ticketId) {
          return { ok: false, command: line, error: 'Missing ticket id.' };
        }
        return applyAction(line, {
          type: 'select_ticket',
          ticketId,
          timestamp: parseTimestamp(args[2]),
        });
      }
      case 'model': {
        if (args[0] !== 'select') {
          return { ok: false, command: line, error: 'Unknown model command.' };
        }
        const modelId = args[1];
        if (!modelId) {
          return { ok: false, command: line, error: 'Missing model id.' };
        }
        const model = ['none', 'null'].includes(modelId.toLowerCase())
          ? null
          : buildModelSpec(modelId);
        return applyAction(line, {
          type: 'select_model',
          model,
          timestamp: parseTimestamp(args[2]),
        });
      }
      case 'block': {
        if (args[0] !== 'place') {
          return { ok: false, command: line, error: 'Unknown block command.' };
        }
        const blockTypeToken = args[1];
        const rowToken = args[2];
        const columnToken = args[3];
        if (!blockTypeToken || !rowToken || !columnToken) {
          return { ok: false, command: line, error: 'Missing block arguments.' };
        }
        const row = Number(rowToken);
        const column = Number(columnToken);
        if (Number.isNaN(row) || Number.isNaN(column)) {
          return { ok: false, command: line, error: 'Invalid grid position.' };
        }
        const width = 1;
        const height = 1;
        if (
          row < 0 ||
          column < 0 ||
          row + height > state.grid.rows ||
          column + width > state.grid.columns
        ) {
          return { ok: false, command: line, error: 'Block does not fit grid.' };
        }
        blockCounter += 1;
        const blockId = `block_${blockCounter}`;
        const blockType = parseBlockType(blockTypeToken);
        const content = args.slice(4).join(' ') || `${blockType} block ${blockId}`;
        const block: ContextBlock = {
          id: blockId,
          type: blockType,
          content,
          width,
          height,
          fidelity: 1,
          noise: 0,
          createdAt: parseTimestamp(),
        };
        return applyAction(line, {
          type: 'place_block',
          block,
          position: { row, column },
        });
      }
      case 'run': {
        if (args[0] !== 'start' && args[0] !== 'complete') {
          return { ok: false, command: line, error: 'Unknown run command.' };
        }
        if (args[0] === 'complete') {
          return applyAction(line, {
            type: 'run_complete',
            timestamp: parseTimestamp(args[1]),
          });
        }
        return applyAction(line, {
          type: 'start_run',
          timestamp: parseTimestamp(args[1]),
        });
      }
      case 'tool': {
        if (args[0] !== 'use') {
          return { ok: false, command: line, error: 'Unknown tool command.' };
        }
        const toolId = args[1];
        if (!toolId) {
          return { ok: false, command: line, error: 'Missing tool id.' };
        }
        return applyAction(line, {
          type: 'use_tool',
          toolId,
          timestamp: parseTimestamp(args[2]),
        });
      }
      default:
        return { ok: false, command: line, error: 'Unknown command.' };
    }
  };

  return {
    handleLine,
    getState: () => state,
  };
};
