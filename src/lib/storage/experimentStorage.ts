import { createEmptyExperiment, CURRENT_EXPERIMENT_VERSION } from '../../data/defaults'
import { safeNormalizeExperiment } from '../../schemas'
import type { GrowthExperiment, StoredExperimentCollection } from '../../types'

export const EXPERIMENT_STORAGE_KEY = 'growthlab:experiments'
export const PREFERENCES_STORAGE_KEY = 'growthlab:preferences'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface StorageReadResult {
  experiments: GrowthExperiment[]
  recovered: boolean
  error: string | null
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function migrateExperiment(raw: unknown, index: number): GrowthExperiment | null {
  if (!isRecord(raw)) return null
  const fallbackId = typeof raw.id === 'string' && raw.id.trim() ? raw.id : `migrated-${index + 1}`
  const fallback = createEmptyExperiment(fallbackId)
  const overview = isRecord(raw.overview) ? raw.overview : {}
  const problemAnalysis = isRecord(raw.problemAnalysis) ? raw.problemAnalysis : {}
  const design = isRecord(raw.design) ? raw.design : {}
  const audience = isRecord(raw.audience) ? raw.audience : {}
  const samplePlan = isRecord(raw.samplePlan) ? raw.samplePlan : {}
  const decisionRules = isRecord(raw.decisionRules) ? raw.decisionRules : {}
  const retrospective = isRecord(raw.retrospective) ? raw.retrospective : {}
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : fallback.createdAt
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt
  const candidate: UnknownRecord = {
    ...fallback,
    ...raw,
    id: fallbackId,
    version: CURRENT_EXPERIMENT_VERSION,
    createdAt,
    updatedAt,
    overview: { ...fallback.overview, ...overview },
    problemAnalysis: { ...fallback.problemAnalysis, ...problemAnalysis },
    design: { ...fallback.design, ...design },
    audience: { ...fallback.audience, ...audience },
    samplePlan: { ...fallback.samplePlan, ...samplePlan },
    decisionRules: { ...fallback.decisionRules, ...decisionRules },
    retrospective: { ...fallback.retrospective, ...retrospective },
    hypotheses: Array.isArray(raw.hypotheses) ? raw.hypotheses : [],
    variants: Array.isArray(raw.variants) ? raw.variants : [],
    metrics: Array.isArray(raw.metrics) ? raw.metrics : [],
    copyPlans: Array.isArray(raw.copyPlans) ? raw.copyPlans : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    launchChecklist: Array.isArray(raw.launchChecklist) ? raw.launchChecklist : fallback.launchChecklist,
  }
  const normalized = safeNormalizeExperiment(candidate)
  return normalized.success ? normalized.data : null
}

export function migrateStoredExperiments(raw: unknown): StoredExperimentCollection {
  const source = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.experiments)
      ? raw.experiments
      : isRecord(raw) && isRecord(raw.experiment)
        ? [raw.experiment]
        : []
  return {
    version: CURRENT_EXPERIMENT_VERSION,
    experiments: source
      .map((experiment, index) => migrateExperiment(experiment, index))
      .filter((experiment): experiment is GrowthExperiment => experiment !== null),
  }
}

export function loadExperiments(storage: StorageLike): StorageReadResult {
  let serialized: string | null
  try {
    serialized = storage.getItem(EXPERIMENT_STORAGE_KEY)
  } catch {
    return { experiments: [], recovered: true, error: '浏览器阻止了本地存储读取，已使用空项目列表。' }
  }
  if (!serialized) return { experiments: [], recovered: false, error: null }
  try {
    const parsed: unknown = JSON.parse(serialized)
    const migrated = migrateStoredExperiments(parsed)
    const expectedCount = Array.isArray(parsed)
      ? parsed.length
      : isRecord(parsed) && Array.isArray(parsed.experiments)
        ? parsed.experiments.length
        : migrated.experiments.length
    return {
      experiments: migrated.experiments,
      recovered: migrated.experiments.length !== expectedCount,
      error: migrated.experiments.length !== expectedCount ? '部分损坏项目已跳过，其余项目已恢复。' : null,
    }
  } catch {
    return { experiments: [], recovered: true, error: '本地数据格式损坏，已安全恢复为空项目列表。可重新导入备份。' }
  }
}

export function saveExperiments(storage: StorageLike, experiments: GrowthExperiment[]): void {
  const normalized = experiments.map((experiment) => {
    const result = safeNormalizeExperiment({ ...experiment, version: CURRENT_EXPERIMENT_VERSION })
    if (!result.success) throw new Error(`实验“${experiment.overview.name}”数据不完整，无法保存`)
    return result.data
  })
  const payload: StoredExperimentCollection = {
    version: CURRENT_EXPERIMENT_VERSION,
    experiments: normalized,
  }
  try {
    storage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    throw new Error('保存失败：本地存储可能已满或被浏览器禁用。请先导出 JSON 备份。')
  }
}

export function upsertExperiment(storage: StorageLike, experiment: GrowthExperiment): GrowthExperiment[] {
  const existing = loadExperiments(storage).experiments
  const updatedExperiment = { ...experiment, updatedAt: new Date().toISOString() }
  const next = existing.some((item) => item.id === experiment.id)
    ? existing.map((item) => item.id === experiment.id ? updatedExperiment : item)
    : [updatedExperiment, ...existing]
  saveExperiments(storage, next)
  return next
}

export function deleteExperiment(storage: StorageLike, experimentId: string): GrowthExperiment[] {
  const next = loadExperiments(storage).experiments.filter((item) => item.id !== experimentId)
  saveExperiments(storage, next)
  return next
}

export function duplicateExperiment(
  experiment: GrowthExperiment,
  newId: string,
  now = new Date().toISOString(),
): GrowthExperiment {
  return {
    ...structuredClone(experiment),
    id: newId,
    version: CURRENT_EXPERIMENT_VERSION,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    overview: { ...experiment.overview, name: `${experiment.overview.name}（副本）` },
  }
}

const SENSITIVE_KEY_PATTERN = /api[-_]?key|authorization|access[-_]?token|secret/i

export function stripSensitiveValues(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSensitiveValues)
  if (!isRecord(value)) return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
      .map(([key, item]) => [key, stripSensitiveValues(item)]),
  )
}

export function saveNonSensitivePreferences(storage: StorageLike, preferences: unknown): void {
  try {
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(stripSensitiveValues(preferences)))
  } catch {
    throw new Error('偏好保存失败：本地存储可能已满或被浏览器禁用。')
  }
}

export function importExperimentJson(serialized: string): GrowthExperiment {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('导入失败：文件不是合法 JSON。请检查文件内容后重试。')
  }
  const migrated = migrateStoredExperiments(
    isRecord(parsed) && 'experiments' in parsed ? parsed : [parsed],
  )
  if (migrated.experiments.length !== 1) {
    throw new Error('导入失败：未找到一个完整的 GrowthLab 实验。')
  }
  const [experiment] = migrated.experiments
  if (!experiment) throw new Error('导入失败：实验数据为空。')
  return experiment
}
