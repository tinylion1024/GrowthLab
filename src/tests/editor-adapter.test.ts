import { describe, expect, it } from 'vitest'
import { DEMO_EXPERIMENT } from '../data'
import {
  editorValuesToExperiment,
  experimentToEditorValues,
  getCompletionPercentage,
  getModuleIssues,
} from '../features/experiments'

describe('editor adapter', () => {
  it('round-trips editable fields without dropping domain-only values', () => {
    const view = experimentToEditorValues(DEMO_EXPERIMENT)
    const roundTripped = editorValuesToExperiment(DEMO_EXPERIMENT, view, DEMO_EXPERIMENT.updatedAt)

    expect(roundTripped.metrics.map((metric) => metric.valueType))
      .toEqual(DEMO_EXPERIMENT.metrics.map((metric) => metric.valueType))
    expect(roundTripped.copyPlans.map((plan) => plan.direction))
      .toEqual(DEMO_EXPERIMENT.copyPlans.map((plan) => plan.direction))
    expect(roundTripped.samplePlan.warnings).toEqual(DEMO_EXPERIMENT.samplePlan.warnings)
    expect(roundTripped.risks.map((risk) => risk.level))
      .toEqual(DEMO_EXPERIMENT.risks.map((risk) => risk.level))
  })

  it('reports incomplete sample planning and invalid traffic allocation', () => {
    const experiment = structuredClone(DEMO_EXPERIMENT)
    experiment.variants[0]!.trafficAllocation = 60
    experiment.samplePlan.totalSampleSize = null

    expect(getModuleIssues(experiment)).toMatchObject({ design: 1, sample: 1 })
    expect(getCompletionPercentage(experiment)).toBeLessThan(100)
  })
})
