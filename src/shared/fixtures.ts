import {
  ContextBlockType,
  ModelProvider,
  QuestStage,
  TicketStatus,
  UpgradeTarget,
  VariantType,
  type ContextBlock,
  type ModelSpec,
  type Ticket,
  type ToolDefinition,
  type Upgrade,
  type Variant,
} from './types';

export interface UpgradeTrack {
  id: string;
  name: string;
  description?: string;
  upgrades: Upgrade[];
}

export const models: ModelSpec[] = [
  {
    id: 'model-gpt-4o',
    provider: ModelProvider.OpenAI,
    name: 'gpt-4o',
    contextWindow: 128000,
    temperature: 0.3,
    topP: 0.9,
  },
  {
    id: 'model-claude-3-5',
    provider: ModelProvider.Anthropic,
    name: 'claude-3.5-sonnet',
    contextWindow: 200000,
    temperature: 0.4,
    topP: 0.95,
  },
  {
    id: 'model-gemini-1-5',
    provider: ModelProvider.Google,
    name: 'gemini-1.5-pro',
    contextWindow: 1000000,
    temperature: 0.2,
    topP: 0.9,
  },
  {
    id: 'model-local-vicuna',
    provider: ModelProvider.Custom,
    name: 'vicuna-13b',
    contextWindow: 4096,
    temperature: 0.6,
    topP: 0.85,
  },
];

export const tools: ToolDefinition[] = [
  {
    id: 'tool-dom-snapshot',
    name: 'domSnapshot',
    description: 'Capture a DOM snapshot for visual diffing.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Target URL to capture.',
        },
      },
      required: ['url'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'Serialized DOM markup.',
        },
        screenshotUrl: {
          type: 'string',
          description: 'Storage URL for the screenshot.',
        },
      },
      required: ['html'],
    },
  },
  {
    id: 'tool-build',
    name: 'build',
    description: 'Run the project build pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Build target identifier.',
        },
      },
      required: ['target'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Build status string.',
        },
        durationSeconds: {
          type: 'number',
          description: 'Build duration in seconds.',
        },
      },
      required: ['status'],
    },
  },
  {
    id: 'tool-test',
    name: 'test',
    description: 'Execute unit and integration tests.',
    inputSchema: {
      type: 'object',
      properties: {
        suite: {
          type: 'string',
          description: 'Test suite name.',
        },
      },
      required: ['suite'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Test status string.',
        },
        reportUrl: {
          type: 'string',
          description: 'Link to the test report.',
        },
      },
      required: ['status'],
    },
  },
];

export const contextBlocks: ContextBlock[] = [
  {
    id: 'block-1',
    type: ContextBlockType.System,
    content: 'You are running the MVP workflow for ContextQuest.',
    tokenEstimate: 18,
    createdAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'block-2',
    type: ContextBlockType.Narrative,
    content: 'Stakeholders want a polished onboarding in the next sprint.',
    tokenEstimate: 16,
    createdAt: '2026-01-12T09:04:00Z',
  },
  {
    id: 'block-3',
    type: ContextBlockType.User,
    content: 'User reported that context panels load slowly on refresh.',
    tokenEstimate: 14,
    createdAt: '2026-01-12T09:06:00Z',
  },
  {
    id: 'block-4',
    type: ContextBlockType.Reference,
    content: 'Design spec v2.3 includes a three-column grid layout.',
    tokenEstimate: 12,
    createdAt: '2026-01-12T09:08:00Z',
  },
  {
    id: 'block-5',
    type: ContextBlockType.Memory,
    content: 'Previous sprint used optimistic updates for ticket status.',
    tokenEstimate: 13,
    createdAt: '2026-01-12T09:09:00Z',
  },
  {
    id: 'block-6',
    type: ContextBlockType.Tool,
    content: 'domSnapshot shows a layout shift on mobile widths.',
    tokenEstimate: 12,
    createdAt: '2026-01-12T09:11:00Z',
  },
  {
    id: 'block-7',
    type: ContextBlockType.Narrative,
    content: 'The build pipeline is stable but slow for production bundles.',
    tokenEstimate: 17,
    createdAt: '2026-01-12T09:13:00Z',
  },
  {
    id: 'block-8',
    type: ContextBlockType.User,
    content: 'Power users requested keyboard shortcuts for ticket focus.',
    tokenEstimate: 15,
    createdAt: '2026-01-12T09:15:00Z',
  },
  {
    id: 'block-9',
    type: ContextBlockType.Reference,
    content: 'Analytics highlight a 12% drop-off after model selection.',
    tokenEstimate: 16,
    createdAt: '2026-01-12T09:18:00Z',
  },
  {
    id: 'block-10',
    type: ContextBlockType.System,
    content: 'Run state ticks every 5 seconds while a quest is active.',
    tokenEstimate: 14,
    createdAt: '2026-01-12T09:20:00Z',
  },
  {
    id: 'block-11',
    type: ContextBlockType.Memory,
    content: 'The QA checklist requires automated test evidence.',
    tokenEstimate: 13,
    createdAt: '2026-01-12T09:22:00Z',
  },
  {
    id: 'block-12',
    type: ContextBlockType.Narrative,
    content: 'Release notes must call out latency wins and tool coverage.',
    tokenEstimate: 15,
    createdAt: '2026-01-12T09:24:00Z',
  },
];

export const tickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'Improve onboarding flow',
    description: 'Streamline the first-time user journey and hints.',
    status: TicketStatus.InProgress,
    stage: QuestStage.Planning,
    createdAt: '2026-01-10T16:00:00Z',
    updatedAt: '2026-01-12T09:05:00Z',
  },
  {
    id: 'ticket-2',
    title: 'Optimize context grid performance',
    description: 'Reduce render time for large context block sets.',
    status: TicketStatus.New,
    stage: QuestStage.Backlog,
    createdAt: '2026-01-11T10:30:00Z',
  },
  {
    id: 'ticket-3',
    title: 'Add keyboard shortcuts',
    description: 'Support navigation between tickets and blocks.',
    status: TicketStatus.InProgress,
    stage: QuestStage.Execution,
    createdAt: '2026-01-11T14:20:00Z',
  },
  {
    id: 'ticket-4',
    title: 'Instrument tool usage analytics',
    description: 'Track tool invocations and time to completion.',
    status: TicketStatus.Blocked,
    stage: QuestStage.Planning,
    createdAt: '2026-01-11T18:45:00Z',
  },
  {
    id: 'ticket-5',
    title: 'Refresh model selection UI',
    description: 'Clarify model capabilities and pricing tiers.',
    status: TicketStatus.New,
    stage: QuestStage.Backlog,
    createdAt: '2026-01-12T08:10:00Z',
  },
  {
    id: 'ticket-6',
    title: 'Automate release readiness checks',
    description: 'Bundle build, test, and evidence capture flows.',
    status: TicketStatus.New,
    stage: QuestStage.Planning,
    createdAt: '2026-01-12T08:30:00Z',
  },
];

export const ticketVariants: Record<string, Variant[]> = {
  'ticket-1': [
    {
      id: 'variant-1a',
      name: 'Onboarding baseline',
      description: 'Balanced model with domSnapshot checks.',
      type: VariantType.Baseline,
      model: models[0],
      tools: [tools[0]],
    },
    {
      id: 'variant-1b',
      name: 'Onboarding experimental',
      description: 'High-context reasoning for richer guidance.',
      type: VariantType.Experimental,
      model: models[1],
      tools: [tools[0], tools[2]],
    },
  ],
  'ticket-2': [
    {
      id: 'variant-2a',
      name: 'Performance baseline',
      description: 'Focus on minimal build impact.',
      type: VariantType.Baseline,
      model: models[3],
      tools: [tools[1]],
    },
    {
      id: 'variant-2b',
      name: 'Performance production',
      description: 'Wide context window for profiling insights.',
      type: VariantType.Production,
      model: models[2],
      tools: [tools[1], tools[2]],
    },
  ],
  'ticket-3': [
    {
      id: 'variant-3a',
      name: 'Shortcut baseline',
      description: 'Quick pass with lightweight model.',
      type: VariantType.Baseline,
      model: models[3],
      tools: [tools[2]],
    },
    {
      id: 'variant-3b',
      name: 'Shortcut experimental',
      description: 'Explore richer interaction flows.',
      type: VariantType.Experimental,
      model: models[0],
      tools: [tools[0], tools[2]],
    },
  ],
  'ticket-4': [
    {
      id: 'variant-4a',
      name: 'Analytics baseline',
      description: 'Instrument with minimal overhead.',
      type: VariantType.Baseline,
      model: models[0],
      tools: [tools[1]],
    },
    {
      id: 'variant-4b',
      name: 'Analytics production',
      description: 'Full event capture and reports.',
      type: VariantType.Production,
      model: models[2],
      tools: [tools[1], tools[2]],
    },
  ],
  'ticket-5': [
    {
      id: 'variant-5a',
      name: 'Model UI baseline',
      description: 'Update copy and selection hints.',
      type: VariantType.Baseline,
      model: models[0],
      tools: [tools[0]],
    },
    {
      id: 'variant-5b',
      name: 'Model UI experimental',
      description: 'High fidelity comparisons and previews.',
      type: VariantType.Experimental,
      model: models[1],
      tools: [tools[0], tools[1]],
    },
  ],
  'ticket-6': [
    {
      id: 'variant-6a',
      name: 'Release checks baseline',
      description: 'Automate build and test steps.',
      type: VariantType.Baseline,
      model: models[0],
      tools: [tools[1], tools[2]],
    },
    {
      id: 'variant-6b',
      name: 'Release checks production',
      description: 'Add domSnapshot evidence capture.',
      type: VariantType.Production,
      model: models[2],
      tools: [tools[0], tools[1], tools[2]],
    },
  ],
};

export const upgradeTracks: UpgradeTrack[] = [
  {
    id: 'track-throughput',
    name: 'Throughput Boost',
    description: 'Increase token budgets and speed for busy squads.',
    upgrades: [
      {
        id: 'upgrade-throughput-1',
        name: 'Token Cache',
        description: 'Expand reusable token cache size.',
        cost: 120,
        effects: [
          {
            id: 'effect-throughput-1',
            description: 'Increase token budget by 15%.',
            modifier: 0.15,
            target: UpgradeTarget.TokenBudget,
          },
        ],
      },
      {
        id: 'upgrade-throughput-2',
        name: 'Fast Lanes',
        description: 'Prioritize low-latency model routing.',
        cost: 180,
        effects: [
          {
            id: 'effect-throughput-2',
            description: 'Reduce latency by 20%.',
            modifier: -0.2,
            target: UpgradeTarget.Latency,
          },
        ],
      },
    ],
  },
  {
    id: 'track-quality',
    name: 'Quality Focus',
    description: 'Improve answer accuracy and context quality.',
    upgrades: [
      {
        id: 'upgrade-quality-1',
        name: 'Verifier Pass',
        description: 'Add a second validation model.',
        cost: 200,
        effects: [
          {
            id: 'effect-quality-1',
            description: 'Increase accuracy by 12%.',
            modifier: 0.12,
            target: UpgradeTarget.Accuracy,
          },
        ],
      },
      {
        id: 'upgrade-quality-2',
        name: 'Context Curator',
        description: 'Enrich context blocks with references.',
        cost: 160,
        effects: [
          {
            id: 'effect-quality-2',
            description: 'Boost context quality by 18%.',
            modifier: 0.18,
            target: UpgradeTarget.ContextQuality,
          },
        ],
      },
    ],
  },
  {
    id: 'track-efficiency',
    name: 'Cost Efficiency',
    description: 'Keep spend low without sacrificing quality.',
    upgrades: [
      {
        id: 'upgrade-efficiency-1',
        name: 'Budget Guardrails',
        description: 'Cap spend per run.',
        cost: 140,
        effects: [
          {
            id: 'effect-efficiency-1',
            description: 'Reduce cost by 10%.',
            modifier: -0.1,
            target: UpgradeTarget.Cost,
          },
        ],
      },
      {
        id: 'upgrade-efficiency-2',
        name: 'Lean Prompting',
        description: 'Trim redundant context blocks.',
        cost: 110,
        effects: [
          {
            id: 'effect-efficiency-2',
            description: 'Reduce latency by 8%.',
            modifier: -0.08,
            target: UpgradeTarget.Latency,
          },
        ],
      },
    ],
  },
];
