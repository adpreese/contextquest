# ContextQuest

ContextQuest is a **deterministic, offline incremental game about web‑dev agents**. Players solve tickets by packing a limited context window (a drag/drop grid) and running a simulated agent that uses tools. The engine is a pure TypeScript state machine suitable for repeatable playthroughs and automated testing. React is a display layer, and a CLI protocol enables LLM‑testing‑friendly simulations.

## Goals (from design)
- Teach **context selection**: what to include, what to omit, and when compression hurts.
- Teach **tool‑driven debugging**: evidence beats vibes (DOM snapshot, stack trace, network trace, tests).
- Teach **model tradeoffs**: speed vs reliability, tool skill vs context skill, cost constraints.
- Support **deterministic, offline** runs suitable for testing/evaluation.

## Non‑goals
- No real code execution, bundling, or live lint/test/build pipelines (everything is simulated).
- No complex agent skill tree; models are equipable loadouts, not pipelines.
- No network requirement.

## Gameplay loop
1. Select a ticket (or quest stage) from the queue.
2. Pack context into the **Context Grid** (freeform drag/drop).
3. Choose a **Model** (agent brain) for the run.
4. Run the agent: **Plan → Tools → Patch (timed)**.
5. Score outcome (Success / Partial / Fail) + defect risk.
6. Earn cash/rep → buy upgrades → unlock harder tickets/tools/models.

## Content scope (MVP)
- 6 tickets (2 CSS, 2 state, 2 build/test).
- 2 variants per ticket (hidden), plus a few 2‑stage quests.
- 10–12 context blocks.
- 3 tools: `domSnapshot`, `build`, `test`.
- 4 models (2 unlocked, 2 unlockable).
- 3 upgrade tracks (window / compression / tooling).
- React UI: drag/drop grid + run panel + upgrades shop.
- CLI protocol mode with JSON responses.
- Unit tests for determinism and replay (strong coverage on engine + CLI).

## Architecture (single package)
```
src/
  engine/    # deterministic state machine + scoring
  cli/       # stdin protocol runner
  ui/        # React UI (Vite + Tailwind + shadcn/ui)
  shared/    # types, constants, fixtures
```

## Determinism requirements
- Engine is **pure TypeScript**: no timers, no `Date.now`.
- Time is explicit: UI calls `TICK(dtMs)`.
- All randomness uses a **seeded RNG**.
- Same seed + actions = identical results.
- Event log supports replay and unit tests.

## Context system (Context Grid)
- Blocks are rectangles placed into a fixed grid; they cannot overlap and must fit.
- Each block has **tags**, **fidelity** (0..1), and **noise** (0..1).
- **Compression** reduces block size at the cost of lower fidelity + higher noise.
- Some blocks are situational (helpful for one variant, misleading for another).
- UI separates **Evidence** (logs/snapshots/traces) from **Knowledge** (code/docs/schema).

## Models (equipable brains)
Models have stats that affect how effectively they use context and tools.

- **Context Skill**: multiplies signal from context blocks.
- **Tool Skill**: multiplies signal from tool outputs; improves tool selection.
- **Planning**: reduces wasted steps; improves consistency.
- **Reliability**: reduces randomness and hallucination/defect risk.
- **Speed**: run time multiplier (affects token burn and throughput).
- **Cost**: tokens/sec while running (economy impact).

Starter roster:
- **Tiny Fast** (unlocked): cheap/quick, lower reliability, “overconfident”.
- **Balanced Generalist** (unlocked): baseline stats, no quirks.
- **Toolwright** (unlock): high tool skill, tool‑first behavior.
- **Archivist** (unlock): high context skill + reliability, slower; “summarizer”.

## Tools + verification
- Core tools (MVP): `domSnapshot`, `build`, `test`.
- Tools are **simulated** and can spawn evidence blocks.
- Some runs include an optional **Verify** step. Using a verifying tool and getting a clean result reduces defect risk and improves rewards.

## Simulation + scoring
- **Signal** is computed from tags present (required/helpful/trap), weighted by fidelity and reduced by noise.
- Model stats modify context/tool signal and reduce penalties.
- Outcomes: **Success / Partial / Fail** with defect risk.
- Feedback explains missing evidence, missing context, and misleading info.

## Tool output schema (structured JSON)
Tool results are structured JSON (not plain strings) for deterministic tests and UI formatting.

```ts
export type ToolEvent = {
  type: "tool";
  toolId: "domSnapshot" | "build" | "test";
  status: "ok" | "fail" | "warn";
  summary: string;
  details?: string;
  tags: string[];
  evidence?: EvidenceSpawn[];
  clues?: VariantClue[];
  cost?: ToolCost;
  seed?: number;
};
```

```ts
export type EvidenceSpawn = {
  blockId: string;
  blockType: "errorLog" | "domSnapshot" | "stackTrace" | "networkTrace";
  title: string;
  fidelity: number; // 0..1
  noise: number;    // 0..1
  tags: string[];
};
```

```ts
export type VariantClue = {
  kind: "positive" | "negative" | "neutral";
  tag: string;
  strength: number; // 0..1
  summary?: string;
};
```

```ts
export type ToolCost = {
  timeMs: number;
  tokenCost: number;
};
```

## CLI protocol (stdin)
Protocol is line‑based; each command returns **one JSON line**.
Human logs can be suppressed with `--json-only`.

Example commands:
```
state
tick 1000
ticket select T-001
model select balanced
block place component 0 0
run start
```

## Save/load
- Multiple named save slots stored in **LocalStorage**.
- State schema should be versioned for future migrations.

## UI stack
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- dnd-kit for drag/drop

## Tests
- Strong unit coverage for **engine** and **CLI** determinism.
- Replay tests from the event log.

## Project status
This is a greenfield implementation based on the January 18, 2026 design doc.
