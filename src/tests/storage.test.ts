import { describe, expect, it } from 'vitest'
import { DEMO_EXPERIMENT } from '../data'
import {
  EXPERIMENT_STORAGE_KEY,
  importExperimentJson,
  loadExperiments,
  migrateStoredExperiments,
  saveExperiments,
  saveNonSensitivePreferences,
  stripSensitiveValues,
  type StorageLike,
} from '../lib/storage'

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
}

describe('experiment storage', () => {
  it('round-trips experiments and migrates legacy arrays', () => {
    const storage = new MemoryStorage()
    saveExperiments(storage, [DEMO_EXPERIMENT])
    expect(loadExperiments(storage).experiments[0]?.overview.name).toBe(DEMO_EXPERIMENT.overview.name)

    const legacy = structuredClone(DEMO_EXPERIMENT)
    const legacyRecord = legacy as unknown as Record<string, unknown>
    delete legacyRecord.design
    delete legacyRecord.version
    const migrated = migrateStoredExperiments([legacyRecord])
    expect(migrated.experiments[0]?.design.randomizationUnit).toBe('用户 ID')
    expect(migrated.experiments[0]?.version).toBe(1)
  })

  it('recovers from corrupt localStorage without throwing', () => {
    const storage = new MemoryStorage()
    storage.setItem(EXPERIMENT_STORAGE_KEY, '{not-json')
    expect(loadExperiments(storage)).toMatchObject({
      experiments: [],
      recovered: true,
    })
  })

  it('never persists API keys or token-like secrets', () => {
    const storage = new MemoryStorage()
    saveNonSensitivePreferences(storage, {
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-sensitive',
      nested: { authorization: 'Bearer secret', model: 'example-model' },
    })
    const serialized = [...storage.values.values()].join('')
    expect(serialized).not.toContain('sk-sensitive')
    expect(serialized).not.toContain('Bearer secret')
    expect(serialized).toContain('example-model')
    expect(stripSensitiveValues({ access_token: 'secret', safe: true })).toEqual({ safe: true })
  })

  it('imports one valid experiment and explains invalid JSON', () => {
    expect(importExperimentJson(JSON.stringify(DEMO_EXPERIMENT)).id).toBe(DEMO_EXPERIMENT.id)
    expect(() => importExperimentJson('not-json')).toThrow('不是合法 JSON')
  })
})
