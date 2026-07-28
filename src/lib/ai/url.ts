import { AiAdapterError } from './errors'

const DEFAULT_CHAT_PATH = '/chat/completions'

export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new AiAdapterError('invalid_configuration', { message: 'API Base URL 不能为空。' })
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new AiAdapterError('invalid_configuration', { message: 'API Base URL 格式无效。' })
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new AiAdapterError('invalid_configuration', {
      message: 'API Base URL 必须使用 http 或 https。',
    })
  }
  if (url.username || url.password) {
    throw new AiAdapterError('invalid_configuration', {
      message: 'API Base URL 不应包含用户名或密码。',
    })
  }

  url.hash = ''
  url.search = ''
  url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString().replace(/\/$/, '')
}

export function buildChatCompletionsUrl(
  baseUrl: string,
  path = DEFAULT_CHAT_PATH,
): string {
  const normalizedBase = normalizeBaseUrl(baseUrl)
  const normalizedPath = path.trim() || DEFAULT_CHAT_PATH
  if (/^https?:\/\//i.test(normalizedPath)) {
    throw new AiAdapterError('invalid_configuration', {
      message: 'API 请求路径必须是相对路径。',
    })
  }
  return `${normalizedBase}/${normalizedPath.replace(/^\/+/, '')}`
}

