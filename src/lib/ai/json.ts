import { AiAdapterError } from './errors'

function tryParse(candidate: string): unknown | undefined {
  try {
    return JSON.parse(candidate)
  } catch {
    return undefined
  }
}

function balancedJsonCandidates(text: string): string[] {
  const candidates: string[] = []
  for (let start = 0; start < text.length; start += 1) {
    const opening = text[start]
    if (opening !== '{' && opening !== '[') continue

    const stack: string[] = [opening]
    let inString = false
    let escaped = false
    for (let index = start + 1; index < text.length; index += 1) {
      const character = text[index]
      if (inString) {
        if (escaped) escaped = false
        else if (character === '\\') escaped = true
        else if (character === '"') inString = false
        continue
      }
      if (character === '"') {
        inString = true
      } else if (character === '{' || character === '[') {
        stack.push(character)
      } else if (character === '}' || character === ']') {
        const expected = character === '}' ? '{' : '['
        if (stack.pop() !== expected) break
        if (stack.length === 0) {
          candidates.push(text.slice(start, index + 1))
          break
        }
      }
    }
  }
  return candidates
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed) throw new AiAdapterError('empty_response')

  const direct = tryParse(trimmed)
  if (direct !== undefined) return direct

  const fencedBlocks = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)]
  for (const match of fencedBlocks) {
    const parsed = tryParse((match[1] ?? '').trim())
    if (parsed !== undefined) return parsed
  }

  for (const candidate of balancedJsonCandidates(trimmed)) {
    const parsed = tryParse(candidate)
    if (parsed !== undefined) return parsed
  }

  throw new AiAdapterError('invalid_json', { rawResponse: trimmed })
}
