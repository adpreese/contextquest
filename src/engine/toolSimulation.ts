import { createSeededRng } from '../shared/rng';
import type {
  ContextBlock,
  ToolDefinition,
  ToolEvent,
} from '../shared/types';
import { ContextBlockType } from '../shared/types';

const buildEvidenceBlock = (
  id: string,
  toolName: string,
  content: string,
): ContextBlock => ({
  id,
  type: ContextBlockType.Tool,
  content,
  width: 2,
  height: 1,
  fidelity: 0.85,
  noise: 0.15,
  source: toolName,
});

const buildDomSnapshotOutput = (
  rng: ReturnType<typeof createSeededRng>,
  input: Record<string, unknown>,
  eventId: string,
) => {
  const viewport = {
    width: Number(input.viewportWidth ?? 1280),
    height: Number(input.viewportHeight ?? 720),
  };
  const nodes = rng.nextInt(120, 240);
  return {
    snapshotId: `snap_${eventId}`,
    nodes,
    viewport,
    summary: `Captured ${nodes} nodes at ${viewport.width}x${viewport.height}.`,
  };
};

const buildBuildOutput = (
  rng: ReturnType<typeof createSeededRng>,
  input: Record<string, unknown>,
) => {
  const durationMs = rng.nextInt(1800, 4200);
  const warnings = rng.nextInt(0, 3);
  const target = typeof input.target === 'string' ? input.target : 'web';
  return {
    status: 'success',
    target,
    durationMs,
    warnings,
    artifacts: [`dist/${target}/bundle.js`],
  };
};

const buildTestOutput = (
  rng: ReturnType<typeof createSeededRng>,
  input: Record<string, unknown>,
) => {
  const total = rng.nextInt(12, 24);
  const failed = rng.nextInt(0, 2);
  const passed = total - failed;
  const durationMs = rng.nextInt(450, 1200);
  const suite = typeof input.suite === 'string' ? input.suite : 'unit';
  return {
    status: failed > 0 ? 'failed' : 'passed',
    suite,
    total,
    passed,
    failed,
    durationMs,
  };
};

const buildToolOutput = (
  toolName: string,
  rng: ReturnType<typeof createSeededRng>,
  input: Record<string, unknown>,
  eventId: string,
): Record<string, unknown> => {
  switch (toolName.toLowerCase()) {
    case 'domsnapshot':
      return buildDomSnapshotOutput(rng, input, eventId);
    case 'build':
      return buildBuildOutput(rng, input);
    case 'test':
      return buildTestOutput(rng, input);
    default:
      return {
        status: 'unsupported',
        message: `Tool ${toolName} is not simulated.`,
      };
  }
};

export const simulateToolInvocation = ({
  tool,
  input,
  seed,
}: {
  tool: ToolDefinition;
  input: Record<string, unknown>;
  seed: string;
}): ToolEvent => {
  const rng = createSeededRng(`${seed}:${tool.id}:${tool.name}`);
  const eventId = `tool_evt_${rng.nextInt(1000, 9999)}`;
  const output = buildToolOutput(tool.name, rng, input, eventId);
  const evidenceBlocks = [
    buildEvidenceBlock(
      `evidence_${eventId}_0`,
      tool.name,
      JSON.stringify(output, null, 2),
    ),
  ];

  return {
    id: eventId,
    toolId: tool.id,
    toolName: tool.name,
    input,
    output,
    evidenceBlocks,
  };
};
