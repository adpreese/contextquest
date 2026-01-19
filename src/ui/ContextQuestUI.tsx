import * as React from 'react'

import type { EngineAction } from '@/engine/actions'
import type { EngineState } from '@/engine/state'
import type { ContextBlock, EngineEvent } from '@/shared/types'

import { reduceEngineState } from '@/engine/reducer'
import { createInitialState } from '@/engine/state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ContextGrid, type GridNode } from '@/ui/ContextGrid'
import { SaveSlotsPanel } from '@/ui/SaveSlotsPanel'
import { SelectedPanels } from '@/ui/SelectedPanels'
import { ToolTimeline } from '@/ui/ToolTimeline'
import { UpgradesShop } from '@/ui/UpgradesShop'

type RunOutcome = 'success' | 'partial' | 'fail'

interface EngineSnapshot {
  state: EngineState
  events: EngineEvent[]
}

const buildGridNodes = (blocks: ContextBlock[]): GridNode[] =>
  blocks.map((block) => {
    const status =
      block.fidelity >= 0.92 ? 'Active' : block.fidelity >= 0.88 ? 'Queued' : 'Locked'
    return {
      id: block.id,
      title: block.content.length > 32 ? `${block.content.slice(0, 32)}…` : block.content,
      tokens: `${block.tokenEstimate ?? 0} tokens`,
      status,
      tier: block.type,
    }
  })

const computeOutcome = (state: EngineState): RunOutcome => {
  if (!state.selectedTicketId || !state.model) {
    return 'fail'
  }
  if (state.runState.score >= state.gameConfig.targetScore) {
    return 'success'
  }
  if (state.runState.tick >= state.gameConfig.maxTicks) {
    return 'fail'
  }
  return 'partial'
}

const engineReducer = (snapshot: EngineSnapshot, action: EngineAction): EngineSnapshot => {
  if (action.type === 'load_state') {
    return {
      state: action.state,
      events: [],
    }
  }
  const timestampedAction = {
    ...action,
    timestamp: action.timestamp ?? new Date().toISOString(),
  }
  const { state, events } = reduceEngineState(snapshot.state, timestampedAction)
  return {
    state,
    events: [...snapshot.events, ...events],
  }
}

export function ContextQuestUI() {
  const [engine, dispatch] = React.useReducer(engineReducer, {
    state: createInitialState(),
    events: [],
  })
  const [runOutcome, setRunOutcome] = React.useState<RunOutcome | null>(null)
  const [gridNodes, setGridNodes] = React.useState<GridNode[]>(() =>
    buildGridNodes(engine.state.blocks),
  )

  React.useEffect(() => {
    setGridNodes(buildGridNodes(engine.state.blocks))
  }, [engine.state.blocks])

  React.useEffect(() => {
    if (engine.state.runState.status === 'running') {
      setRunOutcome(null)
    }
    if (engine.state.runState.status === 'completed') {
      setRunOutcome(computeOutcome(engine.state))
    }
  }, [engine.state])

  React.useEffect(() => {
    if (engine.state.runState.status !== 'running') {
      return
    }
    const interval = window.setInterval(() => {
      dispatch({ type: 'tick' })
    }, 1500)
    return () => window.clearInterval(interval)
  }, [engine.state.runState.status])

  React.useEffect(() => {
    if (engine.state.runState.status !== 'running') {
      return
    }
    const reachedTarget = engine.state.runState.score >= engine.state.gameConfig.targetScore
    const reachedTickLimit = engine.state.runState.tick >= engine.state.gameConfig.maxTicks
    const outOfTools = engine.state.runState.remainingTools <= 0
    if (reachedTarget || reachedTickLimit || outOfTools) {
      dispatch({ type: 'run_complete' })
    }
  }, [
    engine.state.gameConfig.maxTicks,
    engine.state.gameConfig.targetScore,
    engine.state.runState.remainingTools,
    engine.state.runState.score,
    engine.state.runState.status,
    engine.state.runState.tick,
  ])

  const selectedTicket =
    engine.state.tickets.find((ticket) => ticket.id === engine.state.selectedTicketId) ?? null

  const queuedTickets = engine.state.tickets.filter((ticket) => ticket.status === 'new').length
  const activeTools = engine.state.tools.length
  const remainingTools = engine.state.runState.remainingTools
  const maxTicks = engine.state.gameConfig.maxTicks
  const targetScore = engine.state.gameConfig.targetScore
  const scorePerTool = engine.state.gameConfig.scorePerTool
  const runScore = engine.state.runState.score
  const creditsDelta =
    runOutcome === 'success'
      ? '+120'
      : runOutcome === 'partial'
        ? '+40'
        : runOutcome === 'fail'
          ? '-60'
          : '—'
  const runStatusLabel =
    engine.state.runState.status === 'running'
      ? 'Running'
      : engine.state.runState.status === 'completed'
        ? 'Completed'
        : 'Idle'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ContextQuest Control Room
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Context orchestration dashboard
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Balance memory slices, schedule tool runs, and ship upgrades that keep the quest
              engine ahead of the curve.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'tick' })}
              disabled={engine.state.runState.status !== 'running'}
            >
              Sync Context
            </Button>
            <Button
              onClick={() => dispatch({ type: 'start_run' })}
              disabled={engine.state.runState.status === 'running'}
            >
              Start Run
            </Button>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: 'run_complete' })}
              disabled={engine.state.runState.status !== 'running'}
            >
              End Run
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <ContextGrid nodes={gridNodes} onReorder={setGridNodes} />

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Run Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Queued tickets', value: queuedTickets.toString(), delta: 'Open' },
                  { label: 'Active tools', value: activeTools.toString(), delta: runStatusLabel },
                  {
                    label: 'Credits balance',
                    value: engine.state.economy.credits.toLocaleString(),
                    delta: creditsDelta,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-foreground">
                      {item.value}
                    </div>
                    <Badge variant="secondary" className="mt-3">
                      {item.delta}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <ToolTimeline events={engine.events} />
          </div>

          <div className="space-y-6">
            <SelectedPanels
              tickets={engine.state.tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={(ticketId) => dispatch({ type: 'select_ticket', ticketId })}
              models={engine.state.models}
              selectedModel={engine.state.model}
              onSelectModel={(model) => dispatch({ type: 'select_model', model })}
              runOutcome={runOutcome}
              runStatus={runStatusLabel}
            />

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Run Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Hit the target score before the tick limit runs out. Each tool invocation
                  earns {scorePerTool} score and costs {engine.state.economy.toolCost} credits.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Target score
                    </div>
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      {targetScore} points
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Tick limit
                    </div>
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      {maxTicks} ticks
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 p-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Run score
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {runScore.toFixed(1)} / {targetScore}
                    </div>
                  </div>
                  <Badge variant="secondary">{remainingTools} tools remaining</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Tool Loadout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {engine.state.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-foreground">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: 'use_tool', toolId: tool.id })}
                      disabled={
                        engine.state.runState.status !== 'running' || remainingTools <= 0
                      }
                    >
                      Invoke
                    </Button>
                  </div>
                ))}
                <div className="rounded-lg border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                  Invoke tools to build evidence blocks and raise the run score.
                </div>
              </CardContent>
            </Card>

            <SaveSlotsPanel
              engineState={engine.state}
              onLoadState={(state) => dispatch({ type: 'load_state', state })}
            />

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Session Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Scope includes narrative beats for Act II, shield cooldown tuning, and reward
                  loop verification.
                </p>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {['Patch 1.8', 'Starlight', 'Balance pass', 'QA-ready'].map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="secondary" className="w-full">
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <UpgradesShop
          upgrades={engine.state.upgrades}
          ownedUpgrades={engine.state.ownedUpgrades}
          credits={engine.state.economy.credits}
          onPurchase={(upgradeId) => dispatch({ type: 'purchase_upgrade', upgradeId })}
        />
      </div>
    </div>
  )
}
