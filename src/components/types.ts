export type ExperimentStatus = 'draft' | 'ready'
export type SaveState = 'saved' | 'saving' | 'dirty' | 'error'
export type AiState = 'idle' | 'generating' | 'complete' | 'error'
export type Priority = 'low' | 'medium' | 'high'
export type MetricCategory = 'primary' | 'secondary' | 'guardrail' | 'diagnostic'
export type MetricValueType = 'conversion_rate' | 'click_rate' | 'retention_rate' | 'average_order_value' | 'count' | 'custom'
export type RiskLevel = Priority | 'critical'

export interface ExperimentSummary {
  id: string
  name: string
  summary: string
  updatedAt: string
  status: ExperimentStatus
  completion: number
  tags: string[]
}

export interface GrowthContextInput {
  businessScene: string
  currentValue: string
  targetValue: string
  metricType: string
  dailyTraffic: string
  trafficPercentage: string
  alpha: string
  power: string
  constraints: string
  resources: string
  deadline: string
}

export interface OverviewFormValue {
  name: string
  summary: string
  originalProblem: string
  background: string
  currentPerformance: string
  targetPerformance: string
  experimentType: string
  owner: string
  priority: Priority
  tags: string[]
}

export interface ProblemAnalysisValue {
  phenomenon: string
  goal: string
  audience: string
  behaviorPath: string[]
  possibleCauses: string[]
  controllableVariables: string[]
  uncontrollableVariables: string[]
  informationGaps: string[]
}

export interface HypothesisValue {
  id: string
  name: string
  if: string
  then: string
  because: string
  insight: string
  evidence: string
  confidence: Priority
  impact: Priority
  cost: Priority
  priority: number
  validation: string
  isPrimary: boolean
}

export interface VariantValue {
  id: string
  name: string
  type: 'control' | 'treatment'
  description: string
  uniqueDifference: string
  trafficPercentage: number
  developmentRequirements: string
  trackingRequirements: string
}

export interface ExperimentDesignValue {
  experimentUnit: string
  randomizationUnit: string
  allocationMethod: string
  layerNotes: string
  triggerCondition: string
  exposureDefinition: string
  startCondition: string
  stopCondition: string
  variants: VariantValue[]
}

export interface AudienceValue {
  inclusion: string[]
  exclusion: string[]
  userLifecycle: string
  platforms: string[]
  channels: string[]
  regions: string[]
  segments: string[]
  triggerMoment: string
  estimatedSize: string
  contaminationRisk: string
}

export interface MetricValue {
  id: string
  name: string
  category: MetricCategory
  valueType: MetricValueType
  definition: string
  formula: string
  numerator: string
  denominator: string
  window: string
  source: string
  direction: 'increase' | 'decrease' | 'neutral'
  mde: string
  isTracked: boolean
  notes: string
}

export interface SamplePlanValue {
  metricKind: 'proportion' | 'continuous' | 'other'
  baselineRate: string
  targetRate: string
  relativeMde: string
  alpha: string
  power: string
  sidedness: 'one-sided' | 'two-sided'
  groupCount: number
  dailyTraffic: string
  trafficPercentage: string
  splitRatios: string
  samplePerGroup?: number
  totalSample?: number
  estimatedDays?: number
  recommendation: string
  assumptions: string[]
  warnings: string[]
  aiAdvice: string
}

export interface CopyPlanValue {
  id: string
  direction: string
  strategy: 'direct-benefit' | 'lower-friction' | 'social-proof' | 'custom'
  title: string
  subtitle: string
  benefit: string
  cta: string
  supportingText: string
  riskNotice: string
  emptyState: string
  successMessage: string
  errorMessage: string
  scenario: string
  hypothesis: string
  expectedImpact: string
  potentialRisk: string
}

export interface RiskValue {
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

export interface DecisionRulesValue {
  success: string
  failure: string
  observe: string
  rampUp: string
  fullLaunch: string
  rollback: string
  segmentAnalysis: string
  conflictResolution: string
}

export interface RetrospectiveValue {
  background: string
  originalHypothesis: string
  design: string
  actualDuration: string
  sampleSize: string
  dataQuality: string
  primaryResult: string
  segmentResult: string
  guardrailResult: string
  hypothesisValidated: string
  anomalies: string
  businessConclusion: string
  launchDecision: string
  nextActions: string
  discoveries: string
  nextExperiment: string
}

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

export interface ModelSettingsValue {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  requestPath: string
  jsonMode: boolean
  rememberNonSensitive: boolean
}

export type EditorModuleId =
  | 'overview'
  | 'problem'
  | 'hypotheses'
  | 'design'
  | 'audience'
  | 'metrics'
  | 'sample'
  | 'copy'
  | 'risks'
  | 'decision'
  | 'retrospective'
  | 'checklist'

export interface EditorModule {
  id: EditorModuleId
  label: string
  shortLabel: string
  complete: boolean
  issueCount?: number
}

export interface EditorValues {
  overview: OverviewFormValue
  problem: ProblemAnalysisValue
  hypotheses: HypothesisValue[]
  design: ExperimentDesignValue
  audience: AudienceValue
  metrics: MetricValue[]
  sample: SamplePlanValue
  copy: CopyPlanValue[]
  risks: RiskValue[]
  decision: DecisionRulesValue
  retrospective: RetrospectiveValue
  checklist: ChecklistItem[]
}
