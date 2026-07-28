import type { AiErrorCode } from './types'

const ERROR_GUIDANCE: Record<AiErrorCode, { message: string; suggestion: string }> = {
  unauthorized: {
    message: 'API Key 无效或已失效。',
    suggestion: '请检查密钥是否正确、是否有权访问当前模型，然后重新测试连接。',
  },
  forbidden: {
    message: '当前密钥没有访问该接口或模型的权限。',
    suggestion: '请检查账号权限、模型白名单和服务商的访问策略。',
  },
  not_found: {
    message: '未找到请求的接口或模型。',
    suggestion: '请检查 Base URL、请求路径和模型名称。',
  },
  rate_limited: {
    message: '请求过于频繁或账户额度不足。',
    suggestion: '请稍后重试，并检查服务商的限流与余额设置。',
  },
  cors: {
    message: '浏览器无法直接访问该 API，可能被 CORS 策略拦截。',
    suggestion: '请让服务商允许当前站点跨域访问，或使用可信的 serverless API proxy。',
  },
  network: {
    message: '网络连接失败。',
    suggestion: '请检查网络、API 地址和服务状态后重试。',
  },
  timeout: {
    message: 'API 请求超时。',
    suggestion: '请稍后重试，或降低最大输出 Token 数。',
  },
  cancelled: {
    message: '生成已取消。',
    suggestion: '如需继续，请重新生成。',
  },
  empty_response: {
    message: '模型返回了空内容。',
    suggestion: '请重试，或检查模型是否兼容 Chat Completions。',
  },
  invalid_json: {
    message: '模型没有返回可解析的 JSON。',
    suggestion: '可查看原始响应后重新生成，或启用兼容 JSON Mode 的模型。',
  },
  validation: {
    message: '模型返回的数据结构不完整。',
    suggestion: '可查看原始响应后重新生成；缺失的信息不会被自动编造。',
  },
  http: {
    message: 'API 返回了错误响应。',
    suggestion: '请查看服务商状态，并核对模型配置后重试。',
  },
  invalid_configuration: {
    message: '模型配置无效。',
    suggestion: '请检查 Base URL、API Key、模型名称和请求参数。',
  },
}

export class AiAdapterError extends Error {
  readonly code: AiErrorCode
  readonly status?: number
  readonly suggestion: string
  readonly rawResponse?: string

  constructor(
    code: AiErrorCode,
    options: {
      message?: string
      status?: number
      rawResponse?: string
      cause?: unknown
    } = {},
  ) {
    const guidance = ERROR_GUIDANCE[code]
    super(options.message ?? guidance.message, { cause: options.cause })
    this.name = 'AiAdapterError'
    this.code = code
    this.status = options.status
    this.suggestion = guidance.suggestion
    this.rawResponse = options.rawResponse
  }
}

export function isAiAdapterError(error: unknown): error is AiAdapterError {
  return error instanceof AiAdapterError
}

export function sanitizeSensitiveText(value: string, secrets: string[] = []): string {
  let sanitized = value.replace(/Bearer\s+[^\s"',]+/gi, 'Bearer [REDACTED]')
  for (const secret of secrets) {
    if (secret) sanitized = sanitized.split(secret).join('[REDACTED]')
  }
  return sanitized
}

