import type { EngineEvent } from '@/shared/types'
import { EngineEventType } from '@/shared/types'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type TimelineStatus = 'success' | 'running' | 'queued'

type TimelineEntry = {
  id: string
  tool: string
  description: string
  time: string
  status: TimelineStatus
}

interface ToolTimelineProps {
  events: EngineEvent[]
}

const statusStyles: Record<TimelineStatus, 'success' | 'info' | 'warning'> = {
  success: 'success',
  running: 'info',
  queued: 'warning',
}

const formatEventTime = (timestamp: string): string => {
  if (!timestamp) {
    return '—'
  }
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const eventToTimeline = (event: EngineEvent): TimelineEntry | null => {
  switch (event.type) {
    case EngineEventType.RunStarted:
      return {
        id: event.id,
        tool: 'run.start',
        description: 'Run initialized and tools warmed up.',
        time: formatEventTime(event.timestamp),
        status: 'running',
      }
    case EngineEventType.RunTicked:
      return {
        id: event.id,
        tool: 'run.tick',
        description: `Tick advanced to ${(event.payload as { tick?: number }).tick ?? '—'}.`,
        time: formatEventTime(event.timestamp),
        status: 'running',
      }
    case EngineEventType.RunCompleted:
      return {
        id: event.id,
        tool: 'run.complete',
        description: 'Run completed and outcome scored.',
        time: formatEventTime(event.timestamp),
        status: 'success',
      }
    case EngineEventType.ToolInvoked: {
      const payload = event.payload as { toolName?: string; summary?: string }
      return {
        id: event.id,
        tool: payload.toolName ?? 'tool.invoke',
        description: payload.summary ?? 'Tool invocation dispatched.',
        time: formatEventTime(event.timestamp),
        status: 'success',
      }
    }
    default:
      return null
  }
}

export function ToolTimeline({ events }: ToolTimelineProps) {
  const timeline = events
    .map(eventToTimeline)
    .filter((entry): entry is TimelineEntry => Boolean(entry))
    .slice(-6)
    .reverse()

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Tool Invocations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Live run timeline for the active quest cycle.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.length ? (
          timeline.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                <span className="mt-2 h-8 w-px bg-border" />
              </div>
              <div className="flex-1 space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{entry.tool}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.time}</span>
                    <Badge variant={statusStyles[entry.status]}>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            Start a run to populate the timeline.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
