import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const timeline = [
  {
    id: 'run-01',
    tool: 'context.search',
    description: 'Searched vector shards for "outpost shields"',
    time: '09:41',
    status: 'success',
  },
  {
    id: 'run-02',
    tool: 'tool.math',
    description: 'Balanced shield cooldowns vs. encounter pacing',
    time: '09:42',
    status: 'success',
  },
  {
    id: 'run-03',
    tool: 'assets.render',
    description: 'Generated preview for starlight dome visuals',
    time: '09:43',
    status: 'running',
  },
  {
    id: 'run-04',
    tool: 'narrative.compose',
    description: 'Queued dialog rewrite with new objectives',
    time: '09:44',
    status: 'queued',
  },
]

const statusStyles = {
  success: 'success',
  running: 'info',
  queued: 'warning',
} as const

export function ToolTimeline() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Tool Invocations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Live run timeline for the active quest cycle.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.map((entry) => (
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
                  <Badge variant={statusStyles[entry.status as keyof typeof statusStyles]}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{entry.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
