import type { EngineEvent } from '../shared/types';
import { EngineEventType } from '../shared/types';
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
