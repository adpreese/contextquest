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
  if (!state.selectedTicketId) {
    return 'fail'
  }
  if (!state.model) {
    return 'partial'
  }
  return state.runState.tick >= 3 ? 'success' : 'partial'
}

const engineReducer = (snapshot: EngineSnapshot, action: EngineAction): EngineSnapshot => {
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
    if (engine.state.runState.status === 'running' && engine.state.runState.tick >= 3) {
      dispatch({ type: 'run_complete' })
    }
  }, [engine.state.runState.status, engine.state.runState.tick])

  const selectedTicket =
    engine.state.tickets.find((ticket) => ticket.id === engine.state.selectedTicketId) ?? null

  const queuedTickets = engine.state.tickets.filter((ticket) => ticket.status === 'new').length
  const activeTools = engine.state.tools.length
  const creditsDelta =
    runOutcome === 'success' ? '+120' : runOutcome === 'partial' ? '+40' : runOutcome === 'fail' ? '-60' : '—'
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

        <UpgradesShop upgrades={engine.state.upgrades} />
      </div>
    </div>
  )
}
