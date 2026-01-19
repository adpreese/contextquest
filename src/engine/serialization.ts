import type { EngineState } from './state'

export const ENGINE_STATE_SCHEMA_VERSION = 1

export interface EngineStateSnapshot {
  schemaVersion: number
  state: EngineState
}

export const serializeEngineState = (state: EngineState): EngineStateSnapshot => ({
  schemaVersion: ENGINE_STATE_SCHEMA_VERSION,
  state,
})

export const migrateEngineStateSnapshot = (
  snapshot: EngineStateSnapshot,
): EngineStateSnapshot => {
  if (snapshot.schemaVersion === ENGINE_STATE_SCHEMA_VERSION) {
    return snapshot
  }

  return {
    ...snapshot,
    schemaVersion: ENGINE_STATE_SCHEMA_VERSION,
  }
}

export const deserializeEngineState = (snapshot: EngineStateSnapshot): EngineState => {
  const migrated = migrateEngineStateSnapshot(snapshot)
  return migrated.state
}
