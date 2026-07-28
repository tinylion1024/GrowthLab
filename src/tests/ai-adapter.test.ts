import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  AiAdapterError,
  buildChatCompletionsUrl,
  extractJson,
  generateStructured,
  normalizeBaseUrl,
  requestChatCompletion,
} from '../lib/ai'
import {
  clearModelSettings,
  loadModelSettings,
  saveModelSettings,
} from '../features/settings'

afterEach(() => {
  vi.restoreAllMocks()
  clearModelSettings()
})

describe('AI URL helpers', () => {
  it('normalizes trailing slashes and joins a relative path', () => {
    expect(normalizeBaseUrl(' https://api.example.com/v1/// ')).toBe(
      'https://api.example.com/v1',
    )
    expect(
      buildChatCompletionsUrl('https://api.example.com/v1/', '/chat/completions'),
    ).toBe('https://api.example.com/v1/chat/completions')
  })

  it('rejects credentials and non-http protocols', () => {
    expect(() => normalizeBaseUrl('file:///tmp/api')).toThrow(AiAdapterError)
    expect(() => normalizeBaseUrl('https://user:pass@example.com')).toThrow(
      AiAdapterError,
    )
  })
})

describe('AI JSON extraction', () => {
  it('extracts plain, fenced and annotated JSON', () => {
    expect(extractJson('{"ok":true}')).toEqual({ ok: true })
    expect(extractJson('```json\n{"ok":true}\n```')).toEqual({ ok: true })
    expect(extractJson('结果如下：{"text":"包含 } 字符"}，请查收。')).toEqual({
      text: '包含 } 字符',
    })
  })

  it('classifies empty and invalid content', () => {
    try {
      extractJson(' ')
      throw new Error('expected empty response error')
    } catch (error) {
      expect(error).toMatchObject({ code: 'empty_response' })
    }
    try {
      extractJson('不是 JSON')
      throw new Error('expected invalid JSON error')
    } catch (error) {
      expect(error).toMatchObject({ code: 'invalid_json' })
    }
  })
})

describe('OpenAI-compatible adapter', () => {
  it('retries once without response_format when explicitly unsupported', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response('response_format is not supported', { status: 400 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }),
          { status: 200 },
        ),
      )

    const result = await requestChatCompletion(
      {
        apiBaseUrl: 'https://api.example.com/v1',
        apiKey: 'secret-key',
        model: 'test-model',
        jsonMode: true,
      },
      [{ role: 'user', content: 'test' }],
    )

    expect(result.usedJsonMode).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const firstBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    const secondBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))
    expect(firstBody.response_format).toEqual({ type: 'json_object' })
    expect(secondBody.response_format).toBeUndefined()
  })

  it('classifies auth errors without exposing the API key', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Bearer secret-key is invalid', { status: 401 }),
    )
    await expect(
      requestChatCompletion(
        {
          apiBaseUrl: 'https://api.example.com/v1',
          apiKey: 'secret-key',
          model: 'test-model',
        },
        [{ role: 'user', content: 'test' }],
      ),
    ).rejects.toMatchObject({
      code: 'unauthorized',
      rawResponse: 'Bearer [REDACTED] is invalid',
    })
  })

  it('classifies timeout and caller cancellation separately', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    const config = {
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'secret-key',
      model: 'test-model',
    }
    await expect(
      requestChatCompletion(config, [{ role: 'user', content: 'test' }], {
        timeoutMs: 1,
      }),
    ).rejects.toMatchObject({ code: 'timeout' })

    const controller = new AbortController()
    const request = requestChatCompletion(
      config,
      [{ role: 'user', content: 'test' }],
      { signal: controller.signal },
    )
    controller.abort()
    await expect(request).rejects.toMatchObject({ code: 'cancelled' })
  })

  it('reports Zod validation errors with the raw model content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: '{"count":"wrong"}' } }] }),
        { status: 200 },
      ),
    )
    await expect(
      generateStructured(
        {
          apiBaseUrl: 'https://api.example.com/v1',
          apiKey: 'secret-key',
          model: 'test-model',
        },
        [{ role: 'user', content: 'test' }],
        z.object({ count: z.number() }),
      ),
    ).rejects.toMatchObject({
      code: 'validation',
      rawResponse: '{"count":"wrong"}',
    })
  })
})

describe('model settings persistence', () => {
  it('never writes API key to localStorage', () => {
    saveModelSettings({
      ...loadModelSettings(),
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'top-secret',
      model: 'model-a',
      temperature: 0.2,
      rememberNonSensitive: true,
    })

    expect(localStorage.getItem('growthlab:model-settings:v1')).toBe(
      JSON.stringify({
        apiBaseUrl: 'https://api.example.com/v1',
        model: 'model-a',
        temperature: 0.2,
      }),
    )
    expect(localStorage.getItem('growthlab:model-settings:v1')).not.toContain(
      'top-secret',
    )
    expect(loadModelSettings().apiKey).toBe('top-secret')
    expect(sessionStorage.getItem('growthlab:byok-api-key')).toBe('top-secret')
  })
})
