import { AiAdapterError, sanitizeSensitiveText } from './errors'
import { extractJson } from './json'
import { requestChatCompletion } from './client'
import type {
  ChatMessage,
  ChatRequestOptions,
  ModelConnectionConfig,
  SchemaLike,
  StructuredResult,
} from './types'

function validationMessage(error: { issues?: unknown; message?: string }): string {
  if (Array.isArray(error.issues)) {
    const issueSummary = error.issues
      .slice(0, 5)
      .map((issue) => {
        if (!issue || typeof issue !== 'object') return '未知字段错误'
        const record = issue as { path?: unknown[]; message?: string }
        const path = record.path?.join('.') || '根对象'
        return `${path}: ${record.message ?? '格式无效'}`
      })
      .join('；')
    if (issueSummary) return `模型返回的数据结构不完整：${issueSummary}`
  }
  return error.message
    ? `模型返回的数据结构不完整：${error.message}`
    : '模型返回的数据结构不完整。'
}

export async function generateStructured<T>(
  config: ModelConnectionConfig,
  messages: ChatMessage[],
  schema: SchemaLike<T>,
  options: ChatRequestOptions = {},
): Promise<StructuredResult<T>> {
  const response = await requestChatCompletion(config, messages, options)
  let extracted: unknown
  try {
    extracted = extractJson(response.content)
  } catch (error) {
    if (error instanceof AiAdapterError) {
      throw new AiAdapterError(error.code, {
        message: error.message,
        rawResponse: sanitizeSensitiveText(response.content, [config.apiKey]),
        cause: error,
      })
    }
    throw error
  }

  const parsed = schema.safeParse(extracted)
  if (!parsed.success) {
    throw new AiAdapterError('validation', {
      message: validationMessage(parsed.error),
      rawResponse: sanitizeSensitiveText(response.content, [config.apiKey]),
    })
  }
  return {
    data: parsed.data,
    rawResponse: sanitizeSensitiveText(response.content, [config.apiKey]),
    usedJsonMode: response.usedJsonMode,
  }
}

