import type { ContextBlock, ModelSpec, Ticket, ToolDefinition } from '../shared/types';
import { contextBlocks, models, tickets, tools, upgradeTracks } from '../shared/fixtures';

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

export interface UpgradeCatalogItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  tag: string;
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
  models: ModelSpec[];
  model: ModelSpec | null;
  tools: ToolDefinition[];
  upgrades: UpgradeCatalogItem[];
  economy: EconomyState;
  runState: RunState;
  eventCounter: number;
  selectedTicketId: string | null;
}

export const createInitialState = (): EngineState => ({
  tickets,
  grid: {
    rows: 3,
    columns: 4,
    placements: {},
  },
  blocks: contextBlocks,
  models,
  model: models[0] ?? null,
  tools,
  upgrades: upgradeTracks.flatMap((track) =>
    track.upgrades.map((upgrade) => ({
      id: upgrade.id,
      title: upgrade.name,
      description: upgrade.description ?? '',
      cost: upgrade.cost,
      tag: track.name,
    })),
  ),
  economy: {
    credits: 1240,
    tokenBudget: 82340,
    toolBudget: 6,
  },
  runState: {
    status: 'idle',
    tick: 0,
  },
  eventCounter: 0,
  selectedTicketId: tickets[0]?.id ?? null,
});
