import type { ContextBlock, ModelSpec, ToolEvent } from '../shared/types';
import type { GridPosition } from './state';

export type EngineAction =
  | SelectTicketAction
  | SelectModelAction
  | InvokeToolAction
  | PlaceBlockAction
  | MoveBlockAction
  | RemoveBlockAction
  | StartRunAction
  | TickAction
  | RunCompleteAction;

interface ActionMetadata {
  timestamp?: string;
}

export interface SelectTicketAction extends ActionMetadata {
  type: 'select_ticket';
  ticketId: string;
}

export interface SelectModelAction extends ActionMetadata {
  type: 'select_model';
  model: ModelSpec | null;
}

export interface InvokeToolAction extends ActionMetadata {
  type: 'invoke_tool';
  toolEvent: ToolEvent;
}

export interface PlaceBlockAction extends ActionMetadata {
  type: 'place_block';
  block: ContextBlock;
  position: GridPosition;
}

export interface MoveBlockAction extends ActionMetadata {
  type: 'move_block';
  blockId: string;
  position: GridPosition;
}

export interface RemoveBlockAction extends ActionMetadata {
  type: 'remove_block';
  blockId: string;
}

export interface StartRunAction extends ActionMetadata {
  type: 'start_run';
}

export interface TickAction extends ActionMetadata {
  type: 'tick';
}

export interface RunCompleteAction extends ActionMetadata {
  type: 'run_complete';
}
