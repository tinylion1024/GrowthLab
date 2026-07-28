export type ExperimentStatus = 'draft' | 'ready'
export type Priority = 'low' | 'medium' | 'high'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type MetricCategory = 'primary' | 'secondary' | 'guardrail' | 'diagnostic'
export type MetricValueType = 'conversion_rate' | 'click_rate' | 'retention_rate' | 'average_order_value' | 'count' | 'custom'
export type Direction = 'increase' | 'decrease' | 'no_worse'
export type VariantType = 'control' | 'treatment'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type TestTail = 'one-sided' | 'two-sided'

export interface ExperimentOverview {
  name: string
  summary: string
  originalProblem: string
  businessContext: string
  currentPerformance: string
  targetPerformance: string
  experimentType: string
  owner: string
  priority: Priority
  tags: string[]
}

export interface ProblemAnalysis {
  phenomenon: string
  goal: string
  targetAudience: string
  userJourney: string[]
  possibleCauses: string[]
  controllableVariables: string[]
  uncontrollableVariables: string[]
  informationGaps: string[]
}

export interface Hypothesis {
  id: string
  name: string
  if: string
  then: string
  because: string
  userInsight: string
  evidence: string[]
  confidence: ConfidenceLevel
  impact: Priority
  effort: Priority
  priority: number
  validationMethod: string
  isPrimary: boolean
}

export interface ExperimentVariant {
  id: string
  name: string
  type: VariantType
  description: string
  uniqueDifference: string
  trafficAllocation: number
  developmentRequirements: string[]
  trackingRequirements: string[]
}

export interface ExperimentDesign {
  experimentUnit: string
  randomizationUnit: string
  allocationMethod: string
  layerAndExclusion: string
  triggerCondition: string
  exposureDefinition: string
  startCondition: string
  stopCondition: string
}

export interface AudienceDefinition {
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  userLifecycle: string
  platforms: string[]
  channels: string[]
  regions: string[]
  segments: string[]
  triggerTiming: string
  estimatedAudienceSize: number | null
  contaminationRisks: string[]
}

export interface ExperimentMetric {
  id: string
  name: string
  category: MetricCategory
  valueType: MetricValueType
  definition: string
  formula: string
  numerator: string
  denominator: string
  window: string
  dataSource: string
  direction: Direction
  mde: number | null
  hasTracking: boolean | null
  notes: string
}

export interface SamplePlan {
  metricType: 'proportion' | 'continuous' | 'other'
  baselineRate: number | null
  targetRate: number | null
  relativeMde: number | null
  alpha: number
  power: number
  testTail: TestTail
  treatmentGroupCount: number
  dailyEligibleTraffic: number | null
  experimentTrafficRatio: number
  allocationRatios: number[]
  sampleSizePerGroup: number | null
  totalSampleSize: number | null
  estimatedDays: number | null
  recommendedDuration: string
  assumptions: string[]
  warnings: string[]
  aiPlanningAdvice: string
}

export interface CopyContent {
  title: string
  subtitle: string
  benefit: string
  cta: string
  supportingText: string
  riskDisclosure: string
  emptyState: string
  successMessage: string
  failureMessage: string
}

export interface CopyPlan {
  id: string
  name: string
  direction: 'direct-benefit' | 'lower-friction' | 'social-proof' | 'custom'
  scenario: string
  hypothesisId: string
  expectedImpact: string
  potentialRisk: string
  content: CopyContent
}

export interface ExperimentRisk {
  id: string
  description: string
  category: string
  probability: Priority
  impact: Priority
  level: RiskLevel
  warningMetric: string
  mitigation: string
  contingency: string
  owner: string
}

export interface DecisionRules {
  successCriteria: string[]
  failureCriteria: string[]
  observationCriteria: string[]
  rampUpCriteria: string[]
  fullRolloutCriteria: string[]
  rollbackCriteria: string[]
  segmentAnalysis: string[]
  conflictResolution: string[]
}

export interface RetrospectiveTemplate {
  background: string
  originalHypothesis: string
  experimentDesign: string
  actualRunTime: string
  sampleSize: string
  dataQualityChecks: string[]
  primaryResults: string
  segmentResults: string
  guardrailResults: string
  hypothesisValidated: string
  anomaliesAndBiases: string
  businessConclusion: string
  rolloutDecision: string
  nextActions: string[]
  newLearnings: string[]
  nextExperiment: string
}

export interface LaunchChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface GrowthExperiment {
  id: string
  version: number
  createdAt: string
  updatedAt: string
  status: ExperimentStatus
  overview: ExperimentOverview
  problemAnalysis: ProblemAnalysis
  hypotheses: Hypothesis[]
  design: ExperimentDesign
  variants: ExperimentVariant[]
  audience: AudienceDefinition
  metrics: ExperimentMetric[]
  samplePlan: SamplePlan
  copyPlans: CopyPlan[]
  risks: ExperimentRisk[]
  decisionRules: DecisionRules
  launchChecklist: LaunchChecklistItem[]
  retrospective: RetrospectiveTemplate
}

export interface StoredExperimentCollection {
  version: number
  experiments: GrowthExperiment[]
}
