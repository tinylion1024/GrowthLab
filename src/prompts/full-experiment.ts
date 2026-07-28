import type { ChatMessage, GenerationInput } from '../lib/ai/types'
import { GROWTH_EXPERIMENT_SYSTEM_PROMPT } from './system'

const EXPECTED_STRUCTURE = `顶层字段必须为：
- overview: name, summary, originalProblem, businessContext, currentPerformance, targetPerformance, experimentType, owner, priority(low|medium|high), tags[]
- problemAnalysis: phenomenon, goal, targetAudience, userJourney[], possibleCauses[], controllableVariables[], uncontrollableVariables[], informationGaps[]
- hypotheses[]: id, name, if, then, because, userInsight, evidence[], confidence(low|medium|high), impact(low|medium|high), effort(low|medium|high), priority(非负整数), validationMethod, isPrimary
- design: experimentUnit, randomizationUnit, allocationMethod, layerAndExclusion, triggerCondition, exposureDefinition, startCondition, stopCondition
- variants[]: id, name, type(control|treatment), description, uniqueDifference, trafficAllocation(0-100), developmentRequirements[], trackingRequirements[]；流量合计必须为 100
- audience: inclusionCriteria[], exclusionCriteria[], userLifecycle, platforms[], channels[], regions[], segments[], triggerTiming, estimatedAudienceSize(number|null), contaminationRisks[]
- metrics[]: id, name, category(primary|secondary|guardrail|diagnostic), valueType(conversion_rate|click_rate|retention_rate|average_order_value|count|custom), definition, formula, numerator, denominator, window, dataSource, direction(increase|decrease|no_worse), mde(number|null), hasTracking(boolean|null), notes
- samplePlan: metricType(proportion|continuous|other), baselineRate(number|null), targetRate(number|null), relativeMde(number|null), alpha, power, testTail(one-sided|two-sided), treatmentGroupCount, dailyEligibleTraffic(number|null), experimentTrafficRatio, allocationRatios[], sampleSizePerGroup(number|null), totalSampleSize(number|null), estimatedDays(number|null), recommendedDuration, assumptions[], warnings[], aiPlanningAdvice
- copyPlans[]: id, name, direction(direct-benefit|lower-friction|social-proof|custom), scenario, hypothesisId, expectedImpact, potentialRisk, content{title, subtitle, benefit, cta, supportingText, riskDisclosure, emptyState, successMessage, failureMessage}
- risks[]: id, description, category, probability(low|medium|high), impact(low|medium|high), level(low|medium|high|critical), warningMetric, mitigation, contingency, owner
- decisionRules: successCriteria[], failureCriteria[], observationCriteria[], rampUpCriteria[], fullRolloutCriteria[], rollbackCriteria[], segmentAnalysis[], conflictResolution[]
- launchChecklist[]: id, label, completed
- retrospective: background, originalHypothesis, experimentDesign, actualRunTime, sampleSize, dataQualityChecks[], primaryResults, segmentResults, guardrailResults, hypothesisValidated, anomaliesAndBiases, businessConclusion, rolloutDecision, nextActions[], newLearnings[], nextExperiment

id/version/createdAt/updatedAt/status 由 GrowthLab 在浏览器中补全，模型可省略。`

export function buildFullExperimentMessages(input: GenerationInput): ChatMessage[] {
  const context = input.context?.trim() || '未提供补充背景'
  return [
    { role: 'system', content: GROWTH_EXPERIMENT_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请生成完整 GrowthExperiment JSON。

增长问题：
${input.problem.trim()}

补充背景：
${context}

完整覆盖实验概览、问题拆解、核心假设、实验设计、分组、目标人群、指标体系、样本规划、三类可兑现文案方向、相关风险、决策规则、上线清单和复盘模板。未知事实必须标记“待确认”，禁止为了填满字段而编造数据。

${EXPECTED_STRUCTURE}`,
    },
  ]
}
