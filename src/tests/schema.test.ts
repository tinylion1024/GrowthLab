import { describe, expect, it } from 'vitest'
import { DEMO_EXPERIMENT } from '../data'
import { growthExperimentSchema, safeNormalizeExperiment } from '../schemas'

describe('GrowthExperiment schema', () => {
  it('validates the full demo experiment without any escape hatch', () => {
    const result = safeNormalizeExperiment(DEMO_EXPERIMENT)
    expect(result.success).toBe(true)
  })

  it('fills declared defaults and rejects invalid traffic allocation', () => {
    const candidate = structuredClone(DEMO_EXPERIMENT)
    delete (candidate.samplePlan as Partial<typeof candidate.samplePlan>).warnings
    expect(growthExperimentSchema.parse(candidate).samplePlan.warnings).toEqual([])

    const invalid = structuredClone(DEMO_EXPERIMENT)
    invalid.variants[0]!.trafficAllocation = 40
    const result = growthExperimentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.message).toContain('100%')
  })
})
