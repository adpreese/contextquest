import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { EngineState } from '@/engine/state'
import { useMemo, useState } from 'react'
import {
  createSaveSlot,
  loadSaveSlots,
  persistSaveSlots,
  restoreEngineState,
  type SaveSlot,
} from '@/ui/saveSlots'

interface SaveSlotsPanelProps {
  engineState: EngineState
  onLoadState: (state: EngineState) => void
}

const formatTimestamp = (timestamp: string) => {
  const parsed = Date.parse(timestamp)

  if (Number.isNaN(parsed)) {
    return timestamp
  }

  return new Date(parsed).toLocaleString()
}

export function SaveSlotsPanel({ engineState, onLoadState }: SaveSlotsPanelProps) {
  const [slotsPayload, setSlotsPayload] = useState(() => loadSaveSlots())
  const [slotName, setSlotName] = useState('')
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)

  const activeSlot = useMemo(
    () => slotsPayload.slots.find((slot) => slot.id === activeSlotId) ?? null,
    [activeSlotId, slotsPayload.slots],
  )

  const handleSave = () => {
    const trimmedName = slotName.trim()
    const name = trimmedName.length > 0 ? trimmedName : `Snapshot ${slotsPayload.slots.length + 1}`
    const newSlot = createSaveSlot(name, engineState)
    const nextPayload = {
      ...slotsPayload,
      slots: [newSlot, ...slotsPayload.slots],
    }

    setSlotsPayload(nextPayload)
    persistSaveSlots(nextPayload)
    setActiveSlotId(newSlot.id)
    setSlotName('')
  }

  const handleLoad = (slot: SaveSlot) => {
    onLoadState(restoreEngineState(slot))
    setActiveSlotId(slot.id)
  }

  const handleRemove = (slotId: string) => {
    const nextPayload = {
      ...slotsPayload,
      slots: slotsPayload.slots.filter((slot) => slot.id !== slotId),
    }

    setSlotsPayload(nextPayload)
    persistSaveSlots(nextPayload)

    if (activeSlotId === slotId) {
      setActiveSlotId(null)
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Save Slots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Capture this session state so the quest engine can resume exactly where you left off.
        </p>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Snapshot name
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={slotName}
              onChange={(event) => setSlotName(event.target.value)}
              placeholder="Campaign rehearsal"
              className="h-10 flex-1 rounded-md border border-border/60 bg-background px-3 text-sm text-foreground shadow-sm transition"
            />
            <Button className="h-10" onClick={handleSave}>
              Save snapshot
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Active slot
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {activeSlot ? activeSlot.name : 'Unsaved session'}
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Saved slots
          </div>
          {slotsPayload.slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No snapshots saved yet. Create one to store the current engine state.
            </p>
          ) : (
            <div className="space-y-2">
              {slotsPayload.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">{slot.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Saved {formatTimestamp(slot.savedAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleLoad(slot)}
                    >
                      Load
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemove(slot.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
