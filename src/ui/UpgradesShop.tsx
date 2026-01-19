import type { UpgradeCatalogItem } from '@/engine/state'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UpgradesShopProps {
  upgrades: UpgradeCatalogItem[]
}

export function UpgradesShop({ upgrades }: UpgradesShopProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Upgrades Shop</CardTitle>
        <p className="text-sm text-muted-foreground">
          Spend credits to boost your context throughput and tool speed.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {upgrades.map((upgrade) => (
          <Card key={upgrade.id} className="border-border/60 bg-muted/20">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{upgrade.title}</CardTitle>
                <Badge variant="secondary">{upgrade.tag}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{upgrade.description}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {upgrade.cost} credits
              </span>
              <Button size="sm" variant="outline">
                Purchase
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
