import type { ContextBlock, ModelSpec, Ticket, ToolDefinition } from '../shared/types';

export interface GridPosition {
  row: number;
  column: number;
}

export interface GridState {
  rows: number;
  columns: number;
  placements: Record<string, GridPosition>;
}

export interface EconomyState {
  credits: number;
  tokenBudget: number;
  toolBudget: number;
}

export type RunStatus = 'idle' | 'running' | 'completed';

export interface RunState {
  status: RunStatus;
  tick: number;
  lastUpdated?: string;
}

export interface EngineState {
  tickets: Ticket[];
  grid: GridState;
  blocks: ContextBlock[];
  model: ModelSpec | null;
  tools: ToolDefinition[];
  economy: EconomyState;
  runState: RunState;
  eventCounter: number;
  selectedTicketId: string | null;
}

export const createInitialState = (): EngineState => ({
  tickets: [],
  grid: {
    rows: 0,
    columns: 0,
    placements: {},
  },
  blocks: [],
  model: null,
  tools: [],
  economy: {
    credits: 0,
    tokenBudget: 0,
    toolBudget: 0,
  },
  runState: {
    status: 'idle',
    tick: 0,
  },
  eventCounter: 0,
  selectedTicketId: null,
});
