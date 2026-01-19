import type { ContextBlock, EngineEvent } from '../shared/types';
import { ContextBlockType, EngineEventType, UpgradeTarget } from '../shared/types';
import type { EngineAction } from './actions';
import type { EngineState, RunState } from './state';

const canFitBlock = (
  state: EngineState,
  position: { row: number; column: number },
  block: { width: number; height: number },
): boolean =>
  position.row >= 0 &&
  position.column >= 0 &&
  position.row + block.height <= state.grid.rows &&
  position.column + block.width <= state.grid.columns;

const nextEvent = (
  state: EngineState,
  type: EngineEventType,
  payload: Record<string, unknown>,
  timestamp?: string,
): { event: EngineEvent; eventCounter: number } => {
  const nextCounter = state.eventCounter + 1;
  return {
    eventCounter: nextCounter,
    event: {
      id: `evt_${nextCounter}`,
      type,
      timestamp: timestamp ?? state.runState.lastUpdated ?? '',
      payload,
      ticketId: state.selectedTicketId ?? undefined,
      variantId: state.model?.id ?? undefined,
    },
  };
};

const updateRunState = (runState: RunState, timestamp?: string): RunState => ({
  ...runState,
  lastUpdated: timestamp ?? runState.lastUpdated,
});

const computeOutcome = (state: EngineState): 'success' | 'partial' | 'fail' => {
  if (!state.selectedTicketId || !state.model) {
    return 'fail';
  }
  if (state.runState.score >= state.gameConfig.targetScore) {
    return 'success';
  }
  if (state.runState.tick >= state.gameConfig.maxTicks) {
    return 'fail';
  }
  return 'partial';
};

const createToolBlock = (
  toolName: string,
  eventCounter: number,
  timestamp?: string,
): ContextBlock => ({
  id: `tool-block-${eventCounter}`,
  type: ContextBlockType.Tool,
  content: `Tool output: ${toolName} cached new evidence.`,
  width: 1,
  height: 1,
  fidelity: 0.9,
  noise: 0.1,
  tokenEstimate: 12,
  createdAt: timestamp ?? new Date().toISOString(),
});

export const reduceEngineState = (
  state: EngineState,
  action: EngineAction,
): { state: EngineState; events: EngineEvent[] } => {
  switch (action.type) {
    case 'select_ticket': {
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.TicketSelected,
        { ticketId: action.ticketId },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          selectedTicketId: action.ticketId,
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'select_model': {
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.ModelSelected,
        { modelId: action.model?.id ?? null },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          model: action.model,
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'invoke_tool': {
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.ToolInvoked,
        {
          toolEventId: action.toolEvent.id,
          toolId: action.toolEvent.toolId,
          toolName: action.toolEvent.toolName,
          output: action.toolEvent.output,
          evidenceBlockIds: action.toolEvent.evidenceBlocks.map(
            (block) => block.id,
          ),
        },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          blocks: [...state.blocks, ...action.toolEvent.evidenceBlocks],
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'use_tool': {
      if (state.runState.status !== 'running') {
        return { state, events: [] };
      }
      if (state.runState.remainingTools <= 0) {
        return { state, events: [] };
      }
      const tool = state.tools.find((item) => item.id === action.toolId);
      if (!tool) {
        return { state, events: [] };
      }
      const nextCounter = state.eventCounter + 1;
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.ToolInvoked,
        {
          toolEventId: `tool_evt_${nextCounter}`,
          toolId: tool.id,
          toolName: tool.name,
          output: { status: 'ok' },
          evidenceBlockIds: [`tool-block-${nextCounter}`],
        },
        action.timestamp,
      );
      const evidenceBlock = createToolBlock(tool.name, nextCounter, action.timestamp);
      const toolCost = state.economy.toolCost;
      const scoreGain = state.gameConfig.scorePerTool;
      return {
        state: {
          ...state,
          blocks: [...state.blocks, evidenceBlock],
          economy: {
            ...state.economy,
            credits: Math.max(0, state.economy.credits - toolCost),
          },
          runState: updateRunState(
            {
              ...state.runState,
              score: state.runState.score + scoreGain,
              remainingTools: state.runState.remainingTools - 1,
            },
            action.timestamp,
          ),
          eventCounter,
        },
        events: [event],
      };
    }
    case 'purchase_upgrade': {
      if (state.ownedUpgrades.includes(action.upgradeId)) {
        return { state, events: [] };
      }
      const upgrade = state.upgrades.find((item) => item.id === action.upgradeId);
      if (!upgrade || state.economy.credits < upgrade.cost) {
        return { state, events: [] };
      }
      const nextEconomy = {
        ...state.economy,
        credits: state.economy.credits - upgrade.cost,
      };
      const nextGameConfig = { ...state.gameConfig };
      upgrade.effects.forEach((effect) => {
        switch (effect.target) {
          case UpgradeTarget.TokenBudget:
            nextEconomy.tokenBudget = Math.round(
              nextEconomy.tokenBudget * (1 + effect.modifier),
            );
            break;
          case UpgradeTarget.Cost:
            nextEconomy.toolCost = Math.max(
              0,
              Math.round(nextEconomy.toolCost * (1 + effect.modifier)),
            );
            break;
          case UpgradeTarget.Latency:
            nextGameConfig.maxTicks = Math.max(
              2,
              Math.round(nextGameConfig.maxTicks * (1 - effect.modifier)),
            );
            break;
          case UpgradeTarget.Accuracy:
          case UpgradeTarget.ContextQuality:
            nextGameConfig.scorePerTool = Math.max(
              1,
              Number((nextGameConfig.scorePerTool + effect.modifier).toFixed(2)),
            );
            break;
          default:
            break;
        }
      });
      return {
        state: {
          ...state,
          ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
          economy: nextEconomy,
          gameConfig: nextGameConfig,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [],
      };
    }
    case 'place_block': {
      if (!canFitBlock(state, action.position, action.block)) {
        return { state, events: [] };
      }
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.BlockAdded,
        { blockId: action.block.id, position: action.position },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          blocks: [...state.blocks, action.block],
          grid: {
            ...state.grid,
            placements: {
              ...state.grid.placements,
              [action.block.id]: action.position,
            },
          },
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'move_block': {
      const block = state.blocks.find((item) => item.id === action.blockId);
      if (!block || !canFitBlock(state, action.position, block)) {
        return { state, events: [] };
      }
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.BlockMoved,
        { blockId: action.blockId, position: action.position },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          grid: {
            ...state.grid,
            placements: {
              ...state.grid.placements,
              [action.blockId]: action.position,
            },
          },
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'remove_block': {
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.BlockRemoved,
        { blockId: action.blockId },
        action.timestamp,
      );
      const { [action.blockId]: _removed, ...remainingPlacements } = state.grid
        .placements;
      return {
        state: {
          ...state,
          blocks: state.blocks.filter((block) => block.id !== action.blockId),
          grid: {
            ...state.grid,
            placements: remainingPlacements,
          },
          eventCounter,
          runState: updateRunState(state.runState, action.timestamp),
        },
        events: [event],
      };
    }
    case 'start_run': {
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.RunStarted,
        { tick: 0 },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          runState: {
            status: 'running',
            tick: 0,
            score: 0,
            remainingTools: state.economy.toolBudget,
            lastUpdated: action.timestamp ?? state.runState.lastUpdated,
          },
          eventCounter,
        },
        events: [event],
      };
    }
    case 'tick': {
      const nextTick = state.runState.tick + 1;
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.RunTicked,
        { tick: nextTick },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          runState: {
            ...state.runState,
            tick: nextTick,
            lastUpdated: action.timestamp ?? state.runState.lastUpdated,
          },
          eventCounter,
        },
        events: [event],
      };
    }
    case 'run_complete': {
      const outcome = computeOutcome(state);
      const creditsDelta =
        outcome === 'success' ? 120 : outcome === 'partial' ? 40 : -60;
      const { event, eventCounter } = nextEvent(
        state,
        EngineEventType.RunCompleted,
        { tick: state.runState.tick },
        action.timestamp,
      );
      return {
        state: {
          ...state,
          runState: {
            ...state.runState,
            status: 'completed',
            lastUpdated: action.timestamp ?? state.runState.lastUpdated,
          },
          economy: {
            ...state.economy,
            credits: Math.max(0, state.economy.credits + creditsDelta),
          },
          eventCounter,
        },
        events: [event],
      };
    }
    case 'load_state': {
      return {
        state: action.state,
        events: [],
      };
    }
    default:
      return { state, events: [] };
  }
};
