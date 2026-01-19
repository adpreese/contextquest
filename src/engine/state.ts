import type {
  ContextBlock,
  ModelSpec,
  Ticket,
  ToolDefinition,
  UpgradeEffect,
} from '../shared/types';
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
  toolCost: number;
}

export interface UpgradeCatalogItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  tag: string;
  effects: UpgradeEffect[];
}

export type RunStatus = 'idle' | 'running' | 'completed';

export interface RunState {
  status: RunStatus;
  tick: number;
  score: number;
  remainingTools: number;
  lastUpdated?: string;
}

export interface GameConfig {
  targetScore: number;
  maxTicks: number;
  scorePerTool: number;
}

export interface EngineState {
  tickets: Ticket[];
  grid: GridState;
  blocks: ContextBlock[];
  models: ModelSpec[];
  model: ModelSpec | null;
  tools: ToolDefinition[];
  upgrades: UpgradeCatalogItem[];
  ownedUpgrades: string[];
  economy: EconomyState;
  gameConfig: GameConfig;
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
      effects: upgrade.effects,
    })),
  ),
  ownedUpgrades: [],
  economy: {
    credits: 1240,
    tokenBudget: 82340,
    toolBudget: 6,
    toolCost: 80,
  },
  gameConfig: {
    targetScore: 4,
    maxTicks: 3,
    scorePerTool: 1,
  },
  runState: {
    status: 'idle',
    tick: 0,
    score: 0,
    remainingTools: 0,
  },
  eventCounter: 0,
  selectedTicketId: tickets[0]?.id ?? null,
});
