export type AiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'cors'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'empty_response'
  | 'invalid_json'
  | 'validation'
  | 'http'
  | 'invalid_configuration'

export interface ModelConnectionConfig {
  apiBaseUrl: string
  apiKey: string
  model: string
  chatCompletionsPath?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

export interface ChatResponse {
  content: string
  rawResponse: string
  usedJsonMode: boolean
}

export interface StructuredResult<T> {
  data: T
  rawResponse: string
  usedJsonMode: boolean
}

export interface SchemaLike<T> {
  safeParse(value: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues?: unknown; message?: string } }
}

export interface GenerationInput {
  problem: string
  context?: string
}

export type ExperimentModule =
  | 'overview'
  | 'problemAnalysis'
  | 'hypotheses'
  | 'design'
  | 'variants'
  | 'audience'
  | 'metrics'
  | 'samplePlan'
  | 'copyPlans'
  | 'risks'
  | 'decisionRules'
  | 'retrospective'

