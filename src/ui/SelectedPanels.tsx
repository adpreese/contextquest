import type { ModelSpec, Ticket } from '@/shared/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type RunOutcome = 'success' | 'partial' | 'fail'

interface SelectedPanelsProps {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  onSelectTicket: (ticketId: string) => void
  models: ModelSpec[]
  selectedModel: ModelSpec | null
  onSelectModel: (model: ModelSpec | null) => void
  runOutcome: RunOutcome | null
  runStatus: string
}

export function SelectedPanels({
  tickets,
  selectedTicket,
  onSelectTicket,
  models,
  selectedModel,
  onSelectModel,
  runOutcome,
  runStatus,
}: SelectedPanelsProps) {
  const outcomeBadge =
    runOutcome === 'success'
      ? 'success'
      : runOutcome === 'partial'
        ? 'info'
        : runOutcome === 'fail'
          ? 'warning'
          : 'secondary'

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Selected Ticket</CardTitle>
            <Badge variant="info">{selectedTicket?.status ?? 'Unassigned'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedTicket
              ? `${selectedTicket.id} · "${selectedTicket.title}"`
              : 'Pick a ticket to start the run.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Status: {selectedTicket?.status ?? 'None selected'}</p>
            <p>Stage: {selectedTicket?.stage ?? 'Awaiting assignment'}</p>
            <p>Updated: {selectedTicket?.updatedAt ?? selectedTicket?.createdAt ?? 'TBD'}</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {selectedTicket?.tags?.length ? (
              selectedTicket.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.label}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No tags</Badge>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {tickets.map((ticket) => (
                <Button
                  key={ticket.id}
                  size="sm"
                  variant={ticket.id === selectedTicket?.id ? 'default' : 'outline'}
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  {ticket.title}
                </Button>
              ))}
            </div>
            <Button className="w-full" variant="secondary">
              Open Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Selected Model</CardTitle>
            <Badge variant="success">{selectedModel ? 'Online' : 'Offline'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedModel
              ? `${selectedModel.name} • ${selectedModel.contextWindow?.toLocaleString() ?? 'n/a'} context window`
              : 'Assign a model to unlock run stats.'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Tokens remaining</span>
              <span className="font-medium text-foreground">
                {selectedModel?.contextWindow?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Latency budget</span>
              <span className="font-medium text-foreground">1.8s</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tool budget</span>
              <span className="font-medium text-foreground">6 / run</span>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Deployment</span>
            <span className="font-medium text-foreground">
              {selectedModel?.provider ?? '—'}
            </span>
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <Button
                  key={model.id}
                  size="sm"
                  variant={model.id === selectedModel?.id ? 'default' : 'outline'}
                  onClick={() => onSelectModel(model)}
                >
                  {model.name}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => onSelectModel(null)}>
                Clear
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              Swap Model
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Run status</span>
            <Badge variant={outcomeBadge}>
              {runOutcome ? `${runOutcome} (${runStatus})` : runStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
