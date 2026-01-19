import type { ContextBlock, ModelSpec, ToolEvent } from '../shared/types';
import type { EngineState, GridPosition } from './state';

export type EngineAction =
  | SelectTicketAction
  | SelectModelAction
  | InvokeToolAction
  | UseToolAction
  | PurchaseUpgradeAction
  | PlaceBlockAction
  | MoveBlockAction
  | RemoveBlockAction
  | StartRunAction
  | TickAction
  | RunCompleteAction
  | LoadStateAction;

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

export interface UseToolAction extends ActionMetadata {
  type: 'use_tool';
  toolId: string;
}

export interface PurchaseUpgradeAction extends ActionMetadata {
  type: 'purchase_upgrade';
  upgradeId: string;
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

export interface LoadStateAction extends ActionMetadata {
  type: 'load_state';
  state: EngineState;
}
