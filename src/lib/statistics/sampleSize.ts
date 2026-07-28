import type { TestTail } from '../../types'

export interface ProportionSampleSizeInput {
  baselineRate: number
  targetRate?: number | null
  relativeMde?: number | null
  alpha?: number
  power?: number
  testTail?: TestTail
  treatmentGroupCount?: number
  allocationRatios?: number[]
}

export interface ProportionSampleSizeResult {
  targetRate: number
  absoluteEffect: number
  relativeEffect: number
  sampleSizePerGroup: number
  groupSampleSizes: number[]
  totalSampleSize: number
  assumptions: string[]
  warnings: string[]
}

export interface DurationEstimateInput {
  totalSampleSize: number
  dailyEligibleTraffic: number | null
  experimentTrafficRatio?: number
  minimumBusinessCycleDays?: number
}

export interface DurationEstimate {
  estimatedDays: number | null
  recommendedDays: number | null
  recommendedDuration: string
  warnings: string[]
}

function assertProbability(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new RangeError(`${name} 必须大于 0 且小于 1`)
  }
}

/** Peter J. Acklam's rational approximation of the standard-normal quantile. */
export function inverseStandardNormal(probability: number): number {
  assertProbability('概率', probability)
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924] as const
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857] as const
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878] as const
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742] as const
  const lower = 0.02425
  const upper = 1 - lower

  if (probability < lower) {
    const q = Math.sqrt(-2 * Math.log(probability))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])
      / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (probability <= upper) {
    const q = probability - 0.5
    const r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q
      / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  }
  const q = Math.sqrt(-2 * Math.log(1 - probability))
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5])
    / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}

export function calculateProportionSampleSize(input: ProportionSampleSizeInput): ProportionSampleSizeResult {
  const alpha = input.alpha ?? 0.05
  const power = input.power ?? 0.8
  const testTail = input.testTail ?? 'two-sided'
  const treatmentGroupCount = input.treatmentGroupCount ?? 1
  assertProbability('基线比例', input.baselineRate)
  assertProbability('Alpha', alpha)
  assertProbability('Power', power)
  if (!Number.isInteger(treatmentGroupCount) || treatmentGroupCount < 1) {
    throw new RangeError('实验组数量必须是正整数')
  }

  const targetRate = input.targetRate
    ?? (input.relativeMde == null ? Number.NaN : input.baselineRate * (1 + input.relativeMde))
  assertProbability('目标比例', targetRate)
  const absoluteEffect = Math.abs(targetRate - input.baselineRate)
  if (absoluteEffect === 0) throw new RangeError('当前值与目标值不能相同')

  const p1 = input.baselineRate
  const p2 = targetRate
  const pooled = (p1 + p2) / 2
  const zAlpha = inverseStandardNormal(1 - alpha / (testTail === 'two-sided' ? 2 : 1))
  const zPower = inverseStandardNormal(power)
  const numerator = zAlpha * Math.sqrt(2 * pooled * (1 - pooled))
    + zPower * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))
  const equalAllocationPerGroup = Math.ceil((numerator / absoluteEffect) ** 2)
  const groupCount = treatmentGroupCount + 1
  const rawRatios = input.allocationRatios ?? Array.from({ length: groupCount }, () => 1 / groupCount)
  if (rawRatios.length !== groupCount || rawRatios.some((ratio) => !Number.isFinite(ratio) || ratio <= 0)) {
    throw new RangeError(`分流比例必须包含 ${groupCount} 个正数`)
  }
  const ratioSum = rawRatios.reduce((sum, ratio) => sum + ratio, 0)
  const ratios = rawRatios.map((ratio) => ratio / ratioSum)
  const referenceRatio = 1 / groupCount
  const groupSampleSizes = ratios.map((ratio) => Math.ceil(equalAllocationPerGroup * referenceRatio / ratio))
  const totalSampleSize = groupSampleSizes.reduce((sum, size) => sum + size, 0)
  const warnings = ['样本量是基于正态近似的规划估算值，不替代正式统计评审。']
  if (treatmentGroupCount > 1) warnings.push('多个实验组会增加多重比较风险，建议预先指定校正方法。')
  if (Math.max(...ratios) / Math.min(...ratios) > 2) warnings.push('分流明显不均衡，会显著增加小流量组所需样本量。')

  return {
    targetRate,
    absoluteEffect,
    relativeEffect: absoluteEffect / p1,
    sampleSizePerGroup: equalAllocationPerGroup,
    groupSampleSizes,
    totalSampleSize,
    assumptions: [
      '各组样本独立，使用两独立样本比例的正态近似。',
      `${testTail === 'two-sided' ? '双侧' : '单侧'}检验，Alpha=${alpha}，Power=${power}。`,
      `基线 ${(p1 * 100).toFixed(2)}%，目标 ${(p2 * 100).toFixed(2)}%。`,
    ],
    warnings,
  }
}

export function estimateExperimentDuration(input: DurationEstimateInput): DurationEstimate {
  if (!Number.isFinite(input.totalSampleSize) || input.totalSampleSize <= 0) {
    throw new RangeError('总样本量必须大于 0')
  }
  const experimentTrafficRatio = input.experimentTrafficRatio ?? 1
  if (!Number.isFinite(experimentTrafficRatio) || experimentTrafficRatio <= 0 || experimentTrafficRatio > 1) {
    throw new RangeError('实验流量比例必须大于 0 且不超过 1')
  }
  const minimumBusinessCycleDays = input.minimumBusinessCycleDays ?? 7
  if (!Number.isInteger(minimumBusinessCycleDays) || minimumBusinessCycleDays < 1) {
    throw new RangeError('最小业务周期必须是正整数天')
  }
  if (input.dailyEligibleTraffic == null) {
    return {
      estimatedDays: null,
      recommendedDays: null,
      recommendedDuration: '缺少每日符合条件流量，无法估算实验天数',
      warnings: ['没有每日流量时不能伪造实验天数。', '实验至少应覆盖一个完整业务周期。'],
    }
  }
  if (!Number.isFinite(input.dailyEligibleTraffic) || input.dailyEligibleTraffic <= 0) {
    throw new RangeError('每日符合条件流量必须大于 0')
  }
  const dailyExperimentTraffic = input.dailyEligibleTraffic * experimentTrafficRatio
  const estimatedDays = Math.ceil(input.totalSampleSize / dailyExperimentTraffic)
  const recommendedDays = Math.max(estimatedDays, minimumBusinessCycleDays)
  const warnings = ['不建议因为短期显著而随意提前停止实验。']
  if (recommendedDays > estimatedDays) warnings.push(`估算样本可在 ${estimatedDays} 天收集完，但建议至少覆盖 ${minimumBusinessCycleDays} 天完整业务周期。`)
  return {
    estimatedDays,
    recommendedDays,
    recommendedDuration: `预计 ${estimatedDays} 天达到样本量，建议运行至少 ${recommendedDays} 天`,
    warnings,
  }
}

export const calculateSampleSize = calculateProportionSampleSize
export const calculateExperimentDuration = estimateExperimentDuration
