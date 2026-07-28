import { z } from 'zod'
import type { GrowthExperiment } from '../types'

const text = z.string().trim().default('')
const textList = z.array(z.string().trim()).default([])
const nullableNumber = z.number().finite().nullable().default(null)
const priority = z.enum(['low', 'medium', 'high']).default('medium')

export const overviewSchema = z.object({
  name: text,
  summary: text,
  originalProblem: text,
  businessContext: text,
  currentPerformance: text,
  targetPerformance: text,
  experimentType: text,
  owner: text,
  priority,
  tags: textList,
})

export const problemAnalysisSchema = z.object({
  phenomenon: text,
  goal: text,
  targetAudience: text,
  userJourney: textList,
  possibleCauses: textList,
  controllableVariables: textList,
  uncontrollableVariables: textList,
  informationGaps: textList,
})

export const hypothesisSchema = z.object({
  id: z.string().min(1),
  name: text,
  if: text,
  then: text,
  because: text,
  userInsight: text,
  evidence: textList,
  confidence: z.enum(['low', 'medium', 'high']).default('medium'),
  impact: priority,
  effort: priority,
  priority: z.number().int().nonnegative().default(0),
  validationMethod: text,
  isPrimary: z.boolean().default(false),
})

export const variantSchema = z.object({
  id: z.string().min(1),
  name: text,
  type: z.enum(['control', 'treatment']),
  description: text,
  uniqueDifference: text,
  trafficAllocation: z.number().min(0).max(100),
  developmentRequirements: textList,
  trackingRequirements: textList,
})

export const designSchema = z.object({
  experimentUnit: text,
  randomizationUnit: text,
  allocationMethod: text,
  layerAndExclusion: text,
  triggerCondition: text,
  exposureDefinition: text,
  startCondition: text,
  stopCondition: text,
})

export const audienceSchema = z.object({
  inclusionCriteria: textList,
  exclusionCriteria: textList,
  userLifecycle: text,
  platforms: textList,
  channels: textList,
  regions: textList,
  segments: textList,
  triggerTiming: text,
  estimatedAudienceSize: z.number().int().nonnegative().nullable().default(null),
  contaminationRisks: textList,
})

export const metricSchema = z.object({
  id: z.string().min(1),
  name: text,
  category: z.enum(['primary', 'secondary', 'guardrail', 'diagnostic']),
  valueType: z.enum(['conversion_rate', 'click_rate', 'retention_rate', 'average_order_value', 'count', 'custom']),
  definition: text,
  formula: text,
  numerator: text,
  denominator: text,
  window: text,
  dataSource: text,
  direction: z.enum(['increase', 'decrease', 'no_worse']),
  mde: nullableNumber,
  hasTracking: z.boolean().nullable().default(null),
  notes: text,
})

export const samplePlanSchema = z.object({
  metricType: z.enum(['proportion', 'continuous', 'other']).default('proportion'),
  baselineRate: z.number().min(0).max(1).nullable().default(null),
  targetRate: z.number().min(0).max(1).nullable().default(null),
  relativeMde: z.number().positive().nullable().default(null),
  alpha: z.number().gt(0).lt(1).default(0.05),
  power: z.number().gt(0).lt(1).default(0.8),
  testTail: z.enum(['one-sided', 'two-sided']).default('two-sided'),
  treatmentGroupCount: z.number().int().positive().default(1),
  dailyEligibleTraffic: z.number().positive().nullable().default(null),
  experimentTrafficRatio: z.number().gt(0).max(1).default(1),
  allocationRatios: z.array(z.number().positive()).min(2).default([0.5, 0.5]),
  sampleSizePerGroup: z.number().int().positive().nullable().default(null),
  totalSampleSize: z.number().int().positive().nullable().default(null),
  estimatedDays: z.number().int().positive().nullable().default(null),
  recommendedDuration: text,
  assumptions: textList,
  warnings: textList,
  aiPlanningAdvice: text,
})

export const copyPlanSchema = z.object({
  id: z.string().min(1),
  name: text,
  direction: z.enum(['direct-benefit', 'lower-friction', 'social-proof', 'custom']),
  scenario: text,
  hypothesisId: text,
  expectedImpact: text,
  potentialRisk: text,
  content: z.object({
    title: text,
    subtitle: text,
    benefit: text,
    cta: text,
    supportingText: text,
    riskDisclosure: text,
    emptyState: text,
    successMessage: text,
    failureMessage: text,
  }),
})

export const riskSchema = z.object({
  id: z.string().min(1),
  description: text,
  category: text,
  probability: priority,
  impact: priority,
  level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  warningMetric: text,
  mitigation: text,
  contingency: text,
  owner: text,
})

export const decisionRulesSchema = z.object({
  successCriteria: textList,
  failureCriteria: textList,
  observationCriteria: textList,
  rampUpCriteria: textList,
  fullRolloutCriteria: textList,
  rollbackCriteria: textList,
  segmentAnalysis: textList,
  conflictResolution: textList,
})

export const retrospectiveSchema = z.object({
  background: text,
  originalHypothesis: text,
  experimentDesign: text,
  actualRunTime: text,
  sampleSize: text,
  dataQualityChecks: textList,
  primaryResults: text,
  segmentResults: text,
  guardrailResults: text,
  hypothesisValidated: text,
  anomaliesAndBiases: text,
  businessConclusion: text,
  rolloutDecision: text,
  nextActions: textList,
  newLearnings: textList,
  nextExperiment: text,
})

export const launchChecklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1),
  completed: z.boolean().default(false),
})

export const growthExperimentSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'ready']).default('draft'),
  overview: overviewSchema,
  problemAnalysis: problemAnalysisSchema,
  hypotheses: z.array(hypothesisSchema).default([]),
  design: designSchema,
  variants: z.array(variantSchema).default([]),
  audience: audienceSchema,
  metrics: z.array(metricSchema).default([]),
  samplePlan: samplePlanSchema,
  copyPlans: z.array(copyPlanSchema).default([]),
  risks: z.array(riskSchema).default([]),
  decisionRules: decisionRulesSchema,
  launchChecklist: z.array(launchChecklistItemSchema).default([]),
  retrospective: retrospectiveSchema,
}).superRefine((experiment, context) => {
  if (experiment.variants.length > 0) {
    const totalTraffic = experiment.variants.reduce((sum, variant) => sum + variant.trafficAllocation, 0)
    if (Math.abs(totalTraffic - 100) > 0.01) {
      context.addIssue({
        code: 'custom',
        path: ['variants'],
        message: `实验分流总和必须为 100%，当前为 ${totalTraffic}%`,
      })
    }
    if (!experiment.variants.some((variant) => variant.type === 'control')) {
      context.addIssue({ code: 'custom', path: ['variants'], message: '至少需要一个对照组' })
    }
    if (!experiment.variants.some((variant) => variant.type === 'treatment')) {
      context.addIssue({ code: 'custom', path: ['variants'], message: '至少需要一个实验组' })
    }
  }
})

export const storedExperimentCollectionSchema = z.object({
  version: z.number().int().positive(),
  experiments: z.array(growthExperimentSchema),
})

export function normalizeExperiment(input: unknown): GrowthExperiment {
  return growthExperimentSchema.parse(input) as GrowthExperiment
}

export function safeNormalizeExperiment(input: unknown):
  | { success: true; data: GrowthExperiment }
  | { success: false; error: z.ZodError } {
  const result = growthExperimentSchema.safeParse(input)
  return result.success
    ? { success: true, data: result.data as GrowthExperiment }
    : { success: false, error: result.error }
}
