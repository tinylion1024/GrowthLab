import { describe, expect, it } from 'vitest'
import { DEMO_EXPERIMENT } from '../data'
import {
  createMarkdownFilename,
  experimentToJson,
  experimentToMarkdown,
  sanitizeFilename,
} from '../lib/markdown'

describe('professional exports', () => {
  it('renders all review sections and structured tables', () => {
    const markdown = experimentToMarkdown(DEMO_EXPERIMENT)
    expect(markdown).toContain('# 新用户任务页点击率提升实验')
    expect(markdown).toContain('## 1. 问题与目标')
    expect(markdown).toContain('## 10. 上线检查清单')
    expect(markdown).toContain('## 11. 复盘模板')
    expect(markdown).toContain('| 类别 | 指标 |')
    expect(markdown).toContain('- [ ] 假设已经过评审')
    expect(markdown).not.toMatch(/api[-_ ]?key/i)
  })

  it('creates filesystem-safe export filenames', () => {
    expect(sanitizeFilename(' Growth Lab: New/User CTR? ')).toBe('growth-lab-new-user-ctr')
    expect(createMarkdownFilename(DEMO_EXPERIMENT)).toBe('growthlab-new-user-task-ctr.md')
  })

  it('exports valid JSON without secret-shaped fields', () => {
    const candidate = {
      ...DEMO_EXPERIMENT,
      apiKey: 'sk-never-export',
    }
    const json = experimentToJson(candidate)
    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).not.toContain('sk-never-export')
    expect(json).not.toContain('apiKey')
  })
})
