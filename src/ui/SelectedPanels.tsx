import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function SelectedPanels() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Selected Ticket</CardTitle>
            <Badge variant="info">High priority</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Ticket 042 · "Starlight Outpost" — Converge narrative and combat goals.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Owner: Ada (Design Lead)</p>
            <p>ETA: 2h 15m · Dependencies: 3</p>
            <p>Context load: 4.8k tokens</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Questline</Badge>
            <Badge variant="secondary">Combat</Badge>
            <Badge variant="secondary">Narrative</Badge>
            <Badge variant="outline">Sprint 12</Badge>
          </div>
          <Button className="w-full">Open Ticket</Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Selected Model</CardTitle>
            <Badge variant="success">Online</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            NovaXL-4 • 128k context window • 95% tool accuracy
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Tokens remaining</span>
              <span className="font-medium text-foreground">82,340</span>
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
            <span className="font-medium text-foreground">Regional Edge</span>
          </div>
          <Button variant="outline" className="w-full">
            Swap Model
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
