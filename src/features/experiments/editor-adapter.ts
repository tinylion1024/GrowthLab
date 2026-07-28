import type {
  EditorModuleId,
  EditorValues,
  ExperimentSummary,
} from '../../components/types'
import type {
  CopyPlan,
  Direction,
  GrowthExperiment,
  MetricValueType,
} from '../../types'

function joinLines(values: string[]): string {
  return values.join('\n')
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function numberOrNull(value: string): number | null {
  const parsed = Number(value)
  return value.trim() && Number.isFinite(parsed) ? parsed : null
}

function percentToRate(value: string): number | null {
  const parsed = numberOrNull(value)
  return parsed == null ? null : parsed / 100
}

function rateToPercent(value: number | null): string {
  return value == null ? '' : String(Number((value * 100).toFixed(4)))
}

function directionToEditor(value: Direction): EditorValues['metrics'][number]['direction'] {
  return value === 'no_worse' ? 'neutral' : value
}

function directionToDomain(value: EditorValues['metrics'][number]['direction']): Direction {
  return value === 'neutral' ? 'no_worse' : value
}

function copyDirection(value: CopyPlan['direction']): EditorValues['copy'][number]['strategy'] {
  return value
}

export function experimentToEditorValues(experiment: GrowthExperiment): EditorValues {
  return {
    overview: {
      name: experiment.overview.name,
      summary: experiment.overview.summary,
      originalProblem: experiment.overview.originalProblem,
      background: experiment.overview.businessContext,
      currentPerformance: experiment.overview.currentPerformance,
      targetPerformance: experiment.overview.targetPerformance,
      experimentType: experiment.overview.experimentType,
      owner: experiment.overview.owner,
      priority: experiment.overview.priority,
      tags: experiment.overview.tags,
    },
    problem: {
      phenomenon: experiment.problemAnalysis.phenomenon,
      goal: experiment.problemAnalysis.goal,
      audience: experiment.problemAnalysis.targetAudience,
      behaviorPath: experiment.problemAnalysis.userJourney,
      possibleCauses: experiment.problemAnalysis.possibleCauses,
      controllableVariables: experiment.problemAnalysis.controllableVariables,
      uncontrollableVariables: experiment.problemAnalysis.uncontrollableVariables,
      informationGaps: experiment.problemAnalysis.informationGaps,
    },
    hypotheses: experiment.hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      name: hypothesis.name,
      if: hypothesis.if,
      then: hypothesis.then,
      because: hypothesis.because,
      insight: hypothesis.userInsight,
      evidence: joinLines(hypothesis.evidence),
      confidence: hypothesis.confidence,
      impact: hypothesis.impact,
      cost: hypothesis.effort,
      priority: hypothesis.priority,
      validation: hypothesis.validationMethod,
      isPrimary: hypothesis.isPrimary,
    })),
    design: {
      experimentUnit: experiment.design.experimentUnit,
      randomizationUnit: experiment.design.randomizationUnit,
      allocationMethod: experiment.design.allocationMethod,
      layerNotes: experiment.design.layerAndExclusion,
      triggerCondition: experiment.design.triggerCondition,
      exposureDefinition: experiment.design.exposureDefinition,
      startCondition: experiment.design.startCondition,
      stopCondition: experiment.design.stopCondition,
      variants: experiment.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        type: variant.type,
        description: variant.description,
        uniqueDifference: variant.uniqueDifference,
        trafficPercentage: variant.trafficAllocation,
        developmentRequirements: joinLines(variant.developmentRequirements),
        trackingRequirements: joinLines(variant.trackingRequirements),
      })),
    },
    audience: {
      inclusion: experiment.audience.inclusionCriteria,
      exclusion: experiment.audience.exclusionCriteria,
      userLifecycle: experiment.audience.userLifecycle,
      platforms: experiment.audience.platforms,
      channels: experiment.audience.channels,
      regions: experiment.audience.regions,
      segments: experiment.audience.segments,
      triggerMoment: experiment.audience.triggerTiming,
      estimatedSize: experiment.audience.estimatedAudienceSize?.toString() ?? '',
      contaminationRisk: joinLines(experiment.audience.contaminationRisks),
    },
    metrics: experiment.metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      category: metric.category,
      valueType: metric.valueType,
      definition: metric.definition,
      formula: metric.formula,
      numerator: metric.numerator,
      denominator: metric.denominator,
      window: metric.window,
      source: metric.dataSource,
      direction: directionToEditor(metric.direction),
      mde: rateToPercent(metric.mde),
      isTracked: metric.hasTracking ?? false,
      notes: metric.notes,
    })),
    sample: {
      metricKind: experiment.samplePlan.metricType,
      baselineRate: rateToPercent(experiment.samplePlan.baselineRate),
      targetRate: rateToPercent(experiment.samplePlan.targetRate),
      relativeMde: rateToPercent(experiment.samplePlan.relativeMde),
      alpha: String(experiment.samplePlan.alpha),
      power: String(experiment.samplePlan.power),
      sidedness: experiment.samplePlan.testTail,
      groupCount: experiment.samplePlan.treatmentGroupCount,
      dailyTraffic: experiment.samplePlan.dailyEligibleTraffic?.toString() ?? '',
      trafficPercentage: rateToPercent(experiment.samplePlan.experimentTrafficRatio),
      splitRatios: experiment.samplePlan.allocationRatios.map((ratio) => Number((ratio * 100).toFixed(4))).join(','),
      samplePerGroup: experiment.samplePlan.sampleSizePerGroup ?? undefined,
      totalSample: experiment.samplePlan.totalSampleSize ?? undefined,
      estimatedDays: experiment.samplePlan.estimatedDays ?? undefined,
      recommendation: experiment.samplePlan.recommendedDuration,
      assumptions: experiment.samplePlan.assumptions,
      warnings: experiment.samplePlan.warnings,
      aiAdvice: experiment.samplePlan.aiPlanningAdvice,
    },
    copy: experiment.copyPlans.map((plan) => ({
      id: plan.id,
      direction: plan.name,
      strategy: copyDirection(plan.direction),
      title: plan.content.title,
      subtitle: plan.content.subtitle,
      benefit: plan.content.benefit,
      cta: plan.content.cta,
      supportingText: plan.content.supportingText,
      riskNotice: plan.content.riskDisclosure,
      emptyState: plan.content.emptyState,
      successMessage: plan.content.successMessage,
      errorMessage: plan.content.failureMessage,
      scenario: plan.scenario,
      hypothesis: plan.hypothesisId,
      expectedImpact: plan.expectedImpact,
      potentialRisk: plan.potentialRisk,
    })),
    risks: experiment.risks.map((risk) => ({ ...risk })),
    decision: {
      success: joinLines(experiment.decisionRules.successCriteria),
      failure: joinLines(experiment.decisionRules.failureCriteria),
      observe: joinLines(experiment.decisionRules.observationCriteria),
      rampUp: joinLines(experiment.decisionRules.rampUpCriteria),
      fullLaunch: joinLines(experiment.decisionRules.fullRolloutCriteria),
      rollback: joinLines(experiment.decisionRules.rollbackCriteria),
      segmentAnalysis: joinLines(experiment.decisionRules.segmentAnalysis),
      conflictResolution: joinLines(experiment.decisionRules.conflictResolution),
    },
    retrospective: {
      background: experiment.retrospective.background,
      originalHypothesis: experiment.retrospective.originalHypothesis,
      design: experiment.retrospective.experimentDesign,
      actualDuration: experiment.retrospective.actualRunTime,
      sampleSize: experiment.retrospective.sampleSize,
      dataQuality: joinLines(experiment.retrospective.dataQualityChecks),
      primaryResult: experiment.retrospective.primaryResults,
      segmentResult: experiment.retrospective.segmentResults,
      guardrailResult: experiment.retrospective.guardrailResults,
      hypothesisValidated: experiment.retrospective.hypothesisValidated,
      anomalies: experiment.retrospective.anomaliesAndBiases,
      businessConclusion: experiment.retrospective.businessConclusion,
      launchDecision: experiment.retrospective.rolloutDecision,
      nextActions: joinLines(experiment.retrospective.nextActions),
      discoveries: joinLines(experiment.retrospective.newLearnings),
      nextExperiment: experiment.retrospective.nextExperiment,
    },
    checklist: experiment.launchChecklist.map((item) => ({
      id: item.id,
      label: item.label,
      checked: item.completed,
    })),
  }
}

export function editorValuesToExperiment(
  original: GrowthExperiment,
  values: EditorValues,
  now = new Date().toISOString(),
): GrowthExperiment {
  const allocationRatios = values.sample.splitRatios
    .split(',')
    .map((item) => Number(item.trim()) / 100)
    .filter((item) => Number.isFinite(item) && item > 0)
  const checklist = values.checklist.map((item) => ({
    id: item.id,
    label: item.label,
    completed: item.checked,
  }))
  const allChecked = checklist.length > 0 && checklist.every((item) => item.completed)

  return {
    ...original,
    updatedAt: now,
    status: allChecked ? 'ready' : 'draft',
    overview: {
      name: values.overview.name,
      summary: values.overview.summary,
      originalProblem: values.overview.originalProblem,
      businessContext: values.overview.background,
      currentPerformance: values.overview.currentPerformance,
      targetPerformance: values.overview.targetPerformance,
      experimentType: values.overview.experimentType,
      owner: values.overview.owner,
      priority: values.overview.priority,
      tags: values.overview.tags,
    },
    problemAnalysis: {
      phenomenon: values.problem.phenomenon,
      goal: values.problem.goal,
      targetAudience: values.problem.audience,
      userJourney: values.problem.behaviorPath,
      possibleCauses: values.problem.possibleCauses,
      controllableVariables: values.problem.controllableVariables,
      uncontrollableVariables: values.problem.uncontrollableVariables,
      informationGaps: values.problem.informationGaps,
    },
    hypotheses: values.hypotheses.map((hypothesis) => ({
      id: hypothesis.id,
      name: hypothesis.name,
      if: hypothesis.if,
      then: hypothesis.then,
      because: hypothesis.because,
      userInsight: hypothesis.insight,
      evidence: splitLines(hypothesis.evidence),
      confidence: hypothesis.confidence,
      impact: hypothesis.impact,
      effort: hypothesis.cost,
      priority: hypothesis.priority,
      validationMethod: hypothesis.validation,
      isPrimary: hypothesis.isPrimary,
    })),
    design: {
      experimentUnit: values.design.experimentUnit,
      randomizationUnit: values.design.randomizationUnit,
      allocationMethod: values.design.allocationMethod,
      layerAndExclusion: values.design.layerNotes,
      triggerCondition: values.design.triggerCondition,
      exposureDefinition: values.design.exposureDefinition,
      startCondition: values.design.startCondition,
      stopCondition: values.design.stopCondition,
    },
    variants: values.design.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      type: variant.type,
      description: variant.description,
      uniqueDifference: variant.uniqueDifference,
      trafficAllocation: variant.trafficPercentage,
      developmentRequirements: splitLines(variant.developmentRequirements),
      trackingRequirements: splitLines(variant.trackingRequirements),
    })),
    audience: {
      inclusionCriteria: values.audience.inclusion,
      exclusionCriteria: values.audience.exclusion,
      userLifecycle: values.audience.userLifecycle,
      platforms: values.audience.platforms,
      channels: values.audience.channels,
      regions: values.audience.regions,
      segments: values.audience.segments,
      triggerTiming: values.audience.triggerMoment,
      estimatedAudienceSize: numberOrNull(values.audience.estimatedSize),
      contaminationRisks: splitLines(values.audience.contaminationRisk),
    },
    metrics: values.metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      category: metric.category,
      valueType: metric.valueType as MetricValueType,
      definition: metric.definition,
      formula: metric.formula,
      numerator: metric.numerator,
      denominator: metric.denominator,
      window: metric.window,
      dataSource: metric.source,
      direction: directionToDomain(metric.direction),
      mde: percentToRate(metric.mde),
      hasTracking: metric.isTracked,
      notes: metric.notes,
    })),
    samplePlan: {
      metricType: values.sample.metricKind,
      baselineRate: percentToRate(values.sample.baselineRate),
      targetRate: percentToRate(values.sample.targetRate),
      relativeMde: percentToRate(values.sample.relativeMde),
      alpha: numberOrNull(values.sample.alpha) ?? 0.05,
      power: numberOrNull(values.sample.power) ?? 0.8,
      testTail: values.sample.sidedness,
      treatmentGroupCount: values.sample.groupCount,
      dailyEligibleTraffic: numberOrNull(values.sample.dailyTraffic),
      experimentTrafficRatio: percentToRate(values.sample.trafficPercentage) ?? 1,
      allocationRatios: allocationRatios.length ? allocationRatios : original.samplePlan.allocationRatios,
      sampleSizePerGroup: values.sample.samplePerGroup ?? null,
      totalSampleSize: values.sample.totalSample ?? null,
      estimatedDays: values.sample.estimatedDays ?? null,
      recommendedDuration: values.sample.recommendation,
      assumptions: values.sample.assumptions,
      warnings: values.sample.warnings,
      aiPlanningAdvice: values.sample.aiAdvice,
    },
    copyPlans: values.copy.map((plan) => ({
      id: plan.id,
      name: plan.direction,
      direction: plan.strategy,
      scenario: plan.scenario,
      hypothesisId: plan.hypothesis,
      expectedImpact: plan.expectedImpact,
      potentialRisk: plan.potentialRisk,
      content: {
        title: plan.title,
        subtitle: plan.subtitle,
        benefit: plan.benefit,
        cta: plan.cta,
        supportingText: plan.supportingText,
        riskDisclosure: plan.riskNotice,
        emptyState: plan.emptyState,
        successMessage: plan.successMessage,
        failureMessage: plan.errorMessage,
      },
    })),
    risks: values.risks.map((risk) => ({ ...risk })),
    decisionRules: {
      successCriteria: splitLines(values.decision.success),
      failureCriteria: splitLines(values.decision.failure),
      observationCriteria: splitLines(values.decision.observe),
      rampUpCriteria: splitLines(values.decision.rampUp),
      fullRolloutCriteria: splitLines(values.decision.fullLaunch),
      rollbackCriteria: splitLines(values.decision.rollback),
      segmentAnalysis: splitLines(values.decision.segmentAnalysis),
      conflictResolution: splitLines(values.decision.conflictResolution),
    },
    launchChecklist: checklist,
    retrospective: {
      background: values.retrospective.background,
      originalHypothesis: values.retrospective.originalHypothesis,
      experimentDesign: values.retrospective.design,
      actualRunTime: values.retrospective.actualDuration,
      sampleSize: values.retrospective.sampleSize,
      dataQualityChecks: splitLines(values.retrospective.dataQuality),
      primaryResults: values.retrospective.primaryResult,
      segmentResults: values.retrospective.segmentResult,
      guardrailResults: values.retrospective.guardrailResult,
      hypothesisValidated: values.retrospective.hypothesisValidated,
      anomaliesAndBiases: values.retrospective.anomalies,
      businessConclusion: values.retrospective.businessConclusion,
      rolloutDecision: values.retrospective.launchDecision,
      nextActions: splitLines(values.retrospective.nextActions),
      newLearnings: splitLines(values.retrospective.discoveries),
      nextExperiment: values.retrospective.nextExperiment,
    },
  }
}

function hasText(value: string): boolean {
  return Boolean(value.trim())
}

export function getModuleCompletion(experiment: GrowthExperiment): Record<EditorModuleId, boolean> {
  return {
    overview: hasText(experiment.overview.originalProblem) && hasText(experiment.overview.summary),
    problem: hasText(experiment.problemAnalysis.goal) && experiment.problemAnalysis.possibleCauses.length > 0,
    hypotheses: experiment.hypotheses.length > 0 && experiment.hypotheses.some((item) => item.isPrimary),
    design: experiment.variants.length >= 2 && hasText(experiment.design.randomizationUnit),
    audience: experiment.audience.inclusionCriteria.length > 0,
    metrics: experiment.metrics.some((item) => item.category === 'primary') && experiment.metrics.some((item) => item.category === 'guardrail'),
    sample: experiment.samplePlan.totalSampleSize != null,
    copy: experiment.copyPlans.length > 0,
    risks: experiment.risks.length > 0,
    decision: experiment.decisionRules.successCriteria.length > 0 && experiment.decisionRules.rollbackCriteria.length > 0,
    retrospective: hasText(experiment.retrospective.background),
    checklist: experiment.launchChecklist.length > 0 && experiment.launchChecklist.every((item) => item.completed),
  }
}

export function getModuleIssues(experiment: GrowthExperiment): Partial<Record<EditorModuleId, number>> {
  const issues: Partial<Record<EditorModuleId, number>> = {}
  const traffic = experiment.variants.reduce((sum, item) => sum + item.trafficAllocation, 0)
  const designIssues = [
    experiment.variants.length > 0 && Math.abs(traffic - 100) > 0.01,
    experiment.variants.length > 0 && !experiment.variants.some((item) => item.type === 'control'),
    experiment.variants.length > 0 && !experiment.variants.some((item) => item.type === 'treatment'),
  ].filter(Boolean).length
  if (designIssues) issues.design = designIssues
  if (experiment.metrics.length && !experiment.metrics.some((item) => item.category === 'primary')) issues.metrics = 1
  if (experiment.samplePlan.metricType === 'proportion' && experiment.samplePlan.totalSampleSize == null) issues.sample = 1
  return issues
}

export function getCompletionPercentage(experiment: GrowthExperiment): number {
  const values = Object.values(getModuleCompletion(experiment))
  return Math.round((values.filter(Boolean).length / values.length) * 100)
}

export function experimentToSummary(experiment: GrowthExperiment): ExperimentSummary {
  return {
    id: experiment.id,
    name: experiment.overview.name,
    summary: experiment.overview.summary,
    updatedAt: experiment.updatedAt,
    status: experiment.status,
    completion: getCompletionPercentage(experiment),
    tags: experiment.overview.tags,
  }
}
