import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ContextGrid } from '@/ui/ContextGrid'
import { SelectedPanels } from '@/ui/SelectedPanels'
import { ToolTimeline } from '@/ui/ToolTimeline'
import { UpgradesShop } from '@/ui/UpgradesShop'

export function ContextQuestUI() {
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
            <Button variant="outline">Sync Context</Button>
            <Button>Start Run</Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <ContextGrid />

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Run Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Queued tickets', value: '6', delta: '+2' },
                  { label: 'Active tools', value: '4', delta: 'Live' },
                  { label: 'Credits balance', value: '1,240', delta: '-120' },
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

            <ToolTimeline />
          </div>

          <div className="space-y-6">
            <SelectedPanels />

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

        <UpgradesShop />
      </div>
    </div>
  )
}
