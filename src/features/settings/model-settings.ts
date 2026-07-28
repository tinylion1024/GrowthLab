import { clearApiKey, getApiKey, setApiKey } from '../../lib/ai/api-key'

const LOCAL_SETTINGS_KEY = 'growthlab:model-settings:v1'

export interface ModelSettings {
  apiBaseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  chatCompletionsPath: string
  jsonMode: boolean
  rememberNonSensitive: boolean
}

interface PersistedModelSettings {
  apiBaseUrl: string
  model: string
  temperature: number
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: '',
  temperature: 0.3,
  maxTokens: 4_096,
  chatCompletionsPath: '/chat/completions',
  jsonMode: true,
  rememberNonSensitive: false,
}

function localStorageOrNull(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isPersistedSettings(value: unknown): value is PersistedModelSettings {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.apiBaseUrl === 'string' &&
    typeof record.model === 'string' &&
    typeof record.temperature === 'number' &&
    Number.isFinite(record.temperature)
  )
}

export function loadModelSettings(): ModelSettings {
  let persisted: PersistedModelSettings | undefined
  try {
    const raw = localStorageOrNull()?.getItem(LOCAL_SETTINGS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : undefined
    if (isPersistedSettings(parsed)) persisted = parsed
  } catch {
    persisted = undefined
  }
  return {
    ...DEFAULT_MODEL_SETTINGS,
    ...persisted,
    apiKey: getApiKey(),
    rememberNonSensitive: Boolean(persisted),
  }
}

export function saveModelSettings(settings: ModelSettings): void {
  setApiKey(settings.apiKey)
  const storage = localStorageOrNull()
  try {
    if (!settings.rememberNonSensitive) {
      storage?.removeItem(LOCAL_SETTINGS_KEY)
      return
    }
    const persisted: PersistedModelSettings = {
      apiBaseUrl: settings.apiBaseUrl,
      model: settings.model,
      temperature: settings.temperature,
    }
    storage?.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(persisted))
  } catch {
    // Settings remain active in the caller's state if localStorage is unavailable.
  }
}

export function clearModelSettings(): ModelSettings {
  clearApiKey()
  try {
    localStorageOrNull()?.removeItem(LOCAL_SETTINGS_KEY)
  } catch {
    // Clearing in-memory/session credentials remains the security-critical action.
  }
  return { ...DEFAULT_MODEL_SETTINGS }
}

export const MODEL_SETTINGS_SECURITY_NOTICE =
  '密钥仅用于浏览器直接请求，不会写入项目或上传到 GrowthLab。公共多用户生产环境应使用 serverless API proxy，不能在前端内置平台密钥。'

