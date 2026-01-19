import type { EngineState } from '@/engine/state'
import {
  deserializeEngineState,
  migrateEngineStateSnapshot,
  serializeEngineState,
  type EngineStateSnapshot,
} from '@/engine/serialization'

export const SAVE_SLOTS_SCHEMA_VERSION = 1

const STORAGE_KEY = 'contextquest.saveSlots'

export interface SaveSlot {
  id: string
  name: string
  savedAt: string
  snapshot: EngineStateSnapshot
}

export interface SaveSlotsPayload {
  schemaVersion: number
  slots: SaveSlot[]
}

const defaultPayload: SaveSlotsPayload = {
  schemaVersion: SAVE_SLOTS_SCHEMA_VERSION,
  slots: [],
}

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const createSlotId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `slot-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normalizeSnapshot = (value: unknown): EngineStateSnapshot | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const schemaVersion = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0

  if (!('state' in record)) {
    return null
  }

  const snapshot = {
    schemaVersion,
    state: record.state as EngineState,
  }

  return migrateEngineStateSnapshot(snapshot)
}

const normalizeSlot = (value: unknown): SaveSlot | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const snapshot = normalizeSnapshot(record.snapshot)

  if (!snapshot) {
    return null
  }

  return {
    id: typeof record.id === 'string' ? record.id : createSlotId(),
    name: typeof record.name === 'string' ? record.name : 'Untitled slot',
    savedAt: typeof record.savedAt === 'string' ? record.savedAt : new Date().toISOString(),
    snapshot,
  }
}

export const migrateSaveSlots = (payload: SaveSlotsPayload): SaveSlotsPayload => {
  if (payload.schemaVersion === SAVE_SLOTS_SCHEMA_VERSION) {
    return payload
  }

  return {
    ...payload,
    schemaVersion: SAVE_SLOTS_SCHEMA_VERSION,
  }
}

export const loadSaveSlots = (): SaveSlotsPayload => {
  if (!canUseStorage()) {
    return defaultPayload
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return defaultPayload
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!parsed || typeof parsed !== 'object') {
      return defaultPayload
    }

    const record = parsed as Record<string, unknown>
    const slots = Array.isArray(record.slots)
      ? record.slots.map(normalizeSlot).filter((slot): slot is SaveSlot => Boolean(slot))
      : []
    const schemaVersion =
      typeof record.schemaVersion === 'number' ? record.schemaVersion : SAVE_SLOTS_SCHEMA_VERSION

    return migrateSaveSlots({
      schemaVersion,
      slots,
    })
  } catch {
    return defaultPayload
  }
}

export const persistSaveSlots = (payload: SaveSlotsPayload) => {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const createSaveSlot = (name: string, engineState: EngineState): SaveSlot => ({
  id: createSlotId(),
  name,
  savedAt: new Date().toISOString(),
  snapshot: serializeEngineState(engineState),
})

export const restoreEngineState = (slot: SaveSlot): EngineState =>
  deserializeEngineState(slot.snapshot)
