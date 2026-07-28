import { describe, expect, it } from 'vitest'
import {
  calculateProportionSampleSize,
  estimateExperimentDuration,
  inverseStandardNormal,
} from '../lib/statistics'

describe('two-proportion sample size calculator', () => {
  it('calculates a deterministic recommendation for 8% to 12%', () => {
    const result = calculateProportionSampleSize({
      baselineRate: 0.08,
      targetRate: 0.12,
      alpha: 0.05,
      power: 0.8,
      testTail: 'two-sided',
      treatmentGroupCount: 1,
      allocationRatios: [0.5, 0.5],
    })

    expect(result.sampleSizePerGroup).toBe(882)
    expect(result.groupSampleSizes).toEqual([882, 882])
    expect(result.totalSampleSize).toBe(1764)
    expect(result.relativeEffect).toBeCloseTo(0.5)
  })

  it('uses standard normal quantiles and rejects invalid rates', () => {
    expect(inverseStandardNormal(0.975)).toBeCloseTo(1.95996, 4)
    expect(() => calculateProportionSampleSize({ baselineRate: 0.08, targetRate: 0.08 }))
      .toThrow('不能相同')
    expect(() => calculateProportionSampleSize({ baselineRate: 1.2, targetRate: 0.2 }))
      .toThrow('基线比例')
  })

  it('estimates duration without inventing days when traffic is missing', () => {
    expect(estimateExperimentDuration({
      totalSampleSize: 1104,
      dailyEligibleTraffic: null,
    })).toMatchObject({ estimatedDays: null, recommendedDays: null })

    expect(estimateExperimentDuration({
      totalSampleSize: 1104,
      dailyEligibleTraffic: 100,
      experimentTrafficRatio: 0.5,
      minimumBusinessCycleDays: 14,
    })).toMatchObject({ estimatedDays: 23, recommendedDays: 23 })
  })

  it('warns about multiple comparisons', () => {
    const result = calculateProportionSampleSize({
      baselineRate: 0.08,
      targetRate: 0.12,
      treatmentGroupCount: 2,
      allocationRatios: [1, 1, 1],
    })
    expect(result.warnings.join('')).toContain('多重比较')
    expect(result.groupSampleSizes).toHaveLength(3)
  })
})
