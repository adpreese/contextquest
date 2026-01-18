export type ID = string;

export enum TicketStatus {
  New = 'new',
  InProgress = 'in_progress',
  Blocked = 'blocked',
  Completed = 'completed',
  Archived = 'archived',
}

export enum QuestStage {
  Backlog = 'backlog',
  Planning = 'planning',
  Execution = 'execution',
  Review = 'review',
  Completed = 'completed',
}

export interface Tag {
  id: ID;
  label: string;
  color?: string;
}

export interface RNGSeed {
  value: string;
  algorithm?: string;
}

export interface ContextBlock {
  id: ID;
  type: ContextBlockType;
  content: string;
  tags?: Tag[];
  tokenEstimate?: number;
  source?: string;
  createdAt?: string;
}

export enum ContextBlockType {
  Narrative = 'narrative',
  System = 'system',
  User = 'user',
  Tool = 'tool',
  Memory = 'memory',
  Reference = 'reference',
}

export interface Ticket {
  id: ID;
  title: string;
  description?: string;
  status: TicketStatus;
  stage?: QuestStage;
  tags?: Tag[];
  blocks?: ContextBlock[];
  createdAt: string;
  updatedAt?: string;
}

export enum VariantType {
  Baseline = 'baseline',
  Experimental = 'experimental',
  Production = 'production',
}

export interface Variant {
  id: ID;
  name: string;
  description?: string;
  type: VariantType;
  model: ModelSpec;
  tools?: ToolDefinition[];
  upgrades?: Upgrade[];
  scoring?: ScoringProfile;
}

export enum ModelProvider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'google',
  Custom = 'custom',
}

export interface ModelSpec {
  id: ID;
  provider: ModelProvider;
  name: string;
  contextWindow?: number;
  temperature?: number;
  topP?: number;
}

export interface ToolDefinition {
  id: ID;
  name: string;
  description?: string;
  inputSchema?: ToolInputSchema;
  outputSchema: ToolOutputSchema;
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolSchemaField>;
  required?: string[];
}

export interface ToolOutputSchema {
  type: 'object';
  properties: Record<string, ToolSchemaField>;
  required?: string[];
}

export interface ToolSchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  description?: string;
  enum?: string[] | number[] | boolean[];
  properties?: Record<string, ToolSchemaField>;
  items?: ToolSchemaField;
}

export interface Upgrade {
  id: ID;
  name: string;
  description?: string;
  cost: number;
  effects: UpgradeEffect[];
}

export interface UpgradeEffect {
  id: ID;
  description: string;
  modifier: number;
  target: UpgradeTarget;
}

export enum UpgradeTarget {
  TokenBudget = 'token_budget',
  Latency = 'latency',
  Accuracy = 'accuracy',
  Cost = 'cost',
  ContextQuality = 'context_quality',
}

export interface EngineEvent<TPayload = Record<string, unknown>> {
  id: ID;
  type: EngineEventType;
  timestamp: string;
  payload: TPayload;
  ticketId?: ID;
  variantId?: ID;
}

export enum EngineEventType {
  TicketCreated = 'ticket_created',
  TicketUpdated = 'ticket_updated',
  TicketSelected = 'ticket_selected',
  ModelSelected = 'model_selected',
  VariantSelected = 'variant_selected',
  ToolInvoked = 'tool_invoked',
  BlockAdded = 'block_added',
  BlockMoved = 'block_moved',
  BlockRemoved = 'block_removed',
  ScoreComputed = 'score_computed',
  RunStarted = 'run_started',
  RunTicked = 'run_ticked',
  RunCompleted = 'run_completed',
}

export interface ScoringProfile {
  id: ID;
  name: string;
  description?: string;
  weights: ScoreWeight[];
}

export interface ScoreWeight {
  metric: ScoreMetric;
  weight: number;
}

export enum ScoreMetric {
  Relevance = 'relevance',
  Completeness = 'completeness',
  Accuracy = 'accuracy',
  Efficiency = 'efficiency',
  Safety = 'safety',
}

export interface ScoreSummary {
  total: number;
  components: ScoreComponent[];
}

export interface ScoreComponent {
  metric: ScoreMetric;
  value: number;
  max?: number;
  notes?: string;
}
