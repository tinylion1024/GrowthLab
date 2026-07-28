import { AiAdapterError, sanitizeSensitiveText } from './errors'
import type {
  ChatMessage,
  ChatRequestOptions,
  ChatResponse,
  ModelConnectionConfig,
} from './types'
import { buildChatCompletionsUrl } from './url'

const DEFAULT_TIMEOUT_MS = 60_000
const RESPONSE_FORMAT_UNSUPPORTED =
  /(response[_\s-]?format|json[_\s-]?mode).*(unsupported|not supported|unknown|unrecognized|invalid|not allowed)|(?:unsupported|not supported|unknown|unrecognized).*(response[_\s-]?format|json[_\s-]?mode)/i

interface ChatCompletionPayload {
  choices?: Array<{ message?: { content?: string | null } }>
}

function statusCodeToErrorCode(status: number) {
  if (status === 401) return 'unauthorized' as const
  if (status === 403) return 'forbidden' as const
  if (status === 404) return 'not_found' as const
  if (status === 429) return 'rate_limited' as const
  return 'http' as const
}

function looksLikeCorsFailure(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false
  return /failed to fetch|networkerror|load failed|cors/i.test(error.message)
}

function parseContent(rawResponse: string, apiKey: string): string {
  let payload: ChatCompletionPayload
  try {
    payload = JSON.parse(rawResponse) as ChatCompletionPayload
  } catch (cause) {
    throw new AiAdapterError('invalid_json', {
      message: 'API 响应不是合法 JSON。',
      rawResponse: sanitizeSensitiveText(rawResponse, [apiKey]),
      cause,
    })
  }
  const content = payload.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new AiAdapterError('empty_response', {
      rawResponse: sanitizeSensitiveText(rawResponse, [apiKey]),
    })
  }
  return content
}

async function postChat(
  config: ModelConnectionConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
  useJsonMode: boolean,
): Promise<ChatResponse> {
  const url = buildChatCompletionsUrl(config.apiBaseUrl, config.chatCompletionsPath)
  const body: Record<string, unknown> = {
    model: config.model.trim(),
    messages,
    temperature: config.temperature ?? 0.3,
    max_tokens: config.maxTokens ?? 4_096,
  }
  if (useJsonMode) body.response_format = { type: 'json_object' }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
    },
    body: JSON.stringify(body),
    signal,
  })
  const rawResponse = await response.text()
  const safeRawResponse = sanitizeSensitiveText(rawResponse, [config.apiKey])

  if (!response.ok) {
    const error = new AiAdapterError(statusCodeToErrorCode(response.status), {
      status: response.status,
      rawResponse: safeRawResponse,
    })
    if (useJsonMode && RESPONSE_FORMAT_UNSUPPORTED.test(rawResponse)) {
      Object.defineProperty(error, 'responseFormatUnsupported', { value: true })
    }
    throw error
  }

  return {
    content: parseContent(rawResponse, config.apiKey),
    rawResponse: safeRawResponse,
    usedJsonMode: useJsonMode,
  }
}

export async function requestChatCompletion(
  config: ModelConnectionConfig,
  messages: ChatMessage[],
  options: ChatRequestOptions = {},
): Promise<ChatResponse> {
  if (!config.apiKey.trim() || !config.model.trim()) {
    throw new AiAdapterError('invalid_configuration', {
      message: '请先填写 API Key 和模型名称。',
    })
  }

  const controller = new AbortController()
  let timedOut = false
  const onExternalAbort = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) controller.abort(options.signal.reason)
  else options.signal?.addEventListener('abort', onExternalAbort, { once: true })

  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    const jsonMode = config.jsonMode !== false
    try {
      return await postChat(config, messages, controller.signal, jsonMode)
    } catch (error) {
      const unsupported =
        error instanceof AiAdapterError &&
        Boolean(
          (error as AiAdapterError & { responseFormatUnsupported?: boolean })
            .responseFormatUnsupported,
        )
      if (!jsonMode || !unsupported || controller.signal.aborted) throw error
      return await postChat(config, messages, controller.signal, false)
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AiAdapterError(timedOut ? 'timeout' : 'cancelled', { cause: error })
    }
    if (error instanceof AiAdapterError) throw error
    throw new AiAdapterError(looksLikeCorsFailure(error) ? 'cors' : 'network', {
      cause: error,
    })
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', onExternalAbort)
  }
}

export async function testConnection(
  config: ModelConnectionConfig,
  options: ChatRequestOptions = {},
): Promise<{ ok: true; model: string }> {
  await requestChatCompletion(
    { ...config, temperature: 0, maxTokens: Math.min(config.maxTokens ?? 16, 16) },
    [
      { role: 'system', content: '仅回复一个 JSON 对象：{"ok":true}。' },
      { role: 'user', content: '测试连接。' },
    ],
    options,
  )
  return { ok: true, model: config.model.trim() }
}

