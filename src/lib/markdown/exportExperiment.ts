import type { GrowthExperiment } from '../../types'
import { stripSensitiveValues } from '../storage'

function value(value: string | number | null | boolean): string {
  if (value === null || value === '') return '待确认'
  if (typeof value === 'boolean') return value ? '是' : '否'
  return String(value)
}

function cell(input: string | number | null | boolean): string {
  return value(input).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

function list(items: string[], empty = '待确认'): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${empty}`
}

function table(headers: string[], rows: Array<Array<string | number | null | boolean>>): string {
  const header = `| ${headers.join(' | ')} |`
  const divider = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.length
    ? rows.map((row) => `| ${row.map(cell).join(' | ')} |`).join('\n')
    : `| ${headers.map((_, index) => index === 0 ? '待确认' : '—').join(' | ')} |`
  return `${header}\n${divider}\n${body}`
}

function percentage(rate: number | null): string {
  return rate == null ? '待确认' : `${(rate * 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

export function sanitizeFilename(input: string, fallback = 'experiment'): string {
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-+$/g, '')
  const safeFallback = fallback
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return normalized || safeFallback || 'experiment'
}

export function createMarkdownFilename(experiment: GrowthExperiment): string {
  const idFallback = experiment.id.replace(/^demo-/, '')
  return `growthlab-${sanitizeFilename(experiment.overview.name, idFallback)}.md`
}

export function createJsonFilename(experiment: GrowthExperiment): string {
  return createMarkdownFilename(experiment).replace(/\.md$/, '.json')
}

export function experimentToMarkdown(experiment: GrowthExperiment): string {
  const primaryHypothesis = experiment.hypotheses.find((hypothesis) => hypothesis.isPrimary)
  const metricCategory = {
    primary: '核心',
    secondary: '次要',
    guardrail: '护栏',
    diagnostic: '诊断',
  } as const
  const direction = { increase: '提升', decrease: '降低', no_worse: '不恶化' } as const

  return [
    `# ${experiment.overview.name}`,
    '',
    `> ${experiment.overview.summary || '待确认'}`,
    '',
    `- **状态：** ${experiment.status === 'ready' ? '已完成' : '草稿'}`,
    `- **负责人：** ${value(experiment.overview.owner)}`,
    `- **最后更新：** ${experiment.updatedAt}`,
    `- **优先级：** ${experiment.overview.priority}`,
    '',
    '## 1. 问题与目标',
    '',
    `- **原始问题：** ${value(experiment.overview.originalProblem)}`,
    `- **业务背景：** ${value(experiment.overview.businessContext)}`,
    `- **现象：** ${value(experiment.problemAnalysis.phenomenon)}`,
    `- **目标：** ${value(experiment.problemAnalysis.goal)}`,
    `- **当前表现：** ${value(experiment.overview.currentPerformance)}`,
    `- **目标表现：** ${value(experiment.overview.targetPerformance)}`,
    `- **目标人群：** ${value(experiment.problemAnalysis.targetAudience)}`,
    '',
    '### 用户行为路径',
    '',
    list(experiment.problemAnalysis.userJourney),
    '',
    '### 可能原因与信息缺口',
    '',
    table(
      ['可能原因', '可控变量', '不可控变量', '信息缺口'],
      Array.from({
        length: Math.max(
          1,
          experiment.problemAnalysis.possibleCauses.length,
          experiment.problemAnalysis.controllableVariables.length,
          experiment.problemAnalysis.uncontrollableVariables.length,
          experiment.problemAnalysis.informationGaps.length,
        ),
      }, (_, index) => [
        experiment.problemAnalysis.possibleCauses[index] ?? '',
        experiment.problemAnalysis.controllableVariables[index] ?? '',
        experiment.problemAnalysis.uncontrollableVariables[index] ?? '',
        experiment.problemAnalysis.informationGaps[index] ?? '',
      ]),
    ),
    '',
    '## 2. 核心假设',
    '',
    primaryHypothesis ? `**主假设：${primaryHypothesis.name}**` : '**主假设：待确认**',
    '',
    ...experiment.hypotheses.flatMap((hypothesis, index) => [
      `### ${index + 1}. ${hypothesis.name}${hypothesis.isPrimary ? '（主假设）' : ''}`,
      '',
      `> 如果${hypothesis.if}，那么${hypothesis.then}，因为${hypothesis.because}。`,
      '',
      `- 用户洞察：${value(hypothesis.userInsight)}`,
      `- 支撑证据：${hypothesis.evidence.join('；') || '待确认'}`,
      `- 信心 / 影响 / 成本：${hypothesis.confidence} / ${hypothesis.impact} / ${hypothesis.effort}`,
      `- 验证方式：${value(hypothesis.validationMethod)}`,
      '',
    ]),
    '## 3. 实验组与对照组',
    '',
    table(
      ['组名', '类型', '方案描述', '与对照组唯一差异', '流量', '开发要求', '埋点要求'],
      experiment.variants.map((variant) => [
        variant.name,
        variant.type === 'control' ? 'Control' : 'Treatment',
        variant.description,
        variant.uniqueDifference,
        `${variant.trafficAllocation}%`,
        variant.developmentRequirements.join('；'),
        variant.trackingRequirements.join('；'),
      ]),
    ),
    '',
    `- **随机化单位：** ${value(experiment.design.randomizationUnit)}`,
    `- **分流方式：** ${value(experiment.design.allocationMethod)}`,
    `- **触发条件：** ${value(experiment.design.triggerCondition)}`,
    `- **曝光口径：** ${value(experiment.design.exposureDefinition)}`,
    `- **开始条件：** ${value(experiment.design.startCondition)}`,
    `- **停止条件：** ${value(experiment.design.stopCondition)}`,
    `- **实验层 / 互斥：** ${value(experiment.design.layerAndExclusion)}`,
    '',
    '## 4. 目标人群',
    '',
    table(
      ['维度', '定义'],
      [
        ['纳入条件', experiment.audience.inclusionCriteria.join('；')],
        ['排除条件', experiment.audience.exclusionCriteria.join('；')],
        ['新老用户', experiment.audience.userLifecycle],
        ['平台', experiment.audience.platforms.join('；')],
        ['渠道', experiment.audience.channels.join('；')],
        ['地域', experiment.audience.regions.join('；')],
        ['用户分层', experiment.audience.segments.join('；')],
        ['触发时机', experiment.audience.triggerTiming],
        ['预估受众规模', experiment.audience.estimatedAudienceSize],
        ['潜在污染风险', experiment.audience.contaminationRisks.join('；')],
      ],
    ),
    '',
    '## 5. 指标体系',
    '',
    table(
      ['类别', '指标', '定义 / 公式', '窗口', '方向', 'MDE', '数据源', '埋点'],
      experiment.metrics.map((metric) => [
        metricCategory[metric.category],
        metric.name,
        `${metric.definition}<br>${metric.formula}`,
        metric.window,
        direction[metric.direction],
        metric.mde == null ? '待确认' : percentage(metric.mde),
        metric.dataSource,
        metric.hasTracking == null ? '待确认' : metric.hasTracking,
      ]),
    ),
    '',
    '## 6. 样本量与周期',
    '',
    table(
      ['基线', '目标', 'Alpha', 'Power', '检验', '每组样本', '总样本', '预计天数'],
      [[
        percentage(experiment.samplePlan.baselineRate),
        percentage(experiment.samplePlan.targetRate),
        experiment.samplePlan.alpha,
        experiment.samplePlan.power,
        experiment.samplePlan.testTail === 'two-sided' ? '双侧' : '单侧',
        experiment.samplePlan.sampleSizePerGroup,
        experiment.samplePlan.totalSampleSize,
        experiment.samplePlan.estimatedDays,
      ]],
    ),
    '',
    `**建议运行周期：** ${value(experiment.samplePlan.recommendedDuration)}`,
    '',
    '**计算假设**',
    '',
    list(experiment.samplePlan.assumptions),
    '',
    '**注意事项**',
    '',
    list(experiment.samplePlan.warnings),
    '',
    '## 7. 页面文案',
    '',
    ...experiment.copyPlans.flatMap((plan, index) => [
      `### ${index + 1}. ${plan.name}`,
      '',
      `- **使用场景：** ${value(plan.scenario)}`,
      `- **对应假设：** ${value(plan.hypothesisId)}`,
      `- **预期影响：** ${value(plan.expectedImpact)}`,
      `- **潜在风险：** ${value(plan.potentialRisk)}`,
      '',
      table(
        ['位置', '文案'],
        [
          ['标题', plan.content.title],
          ['副标题', plan.content.subtitle],
          ['核心利益点', plan.content.benefit],
          ['CTA', plan.content.cta],
          ['辅助说明', plan.content.supportingText],
          ['风险提示', plan.content.riskDisclosure],
          ['空状态', plan.content.emptyState],
          ['成功提示', plan.content.successMessage],
          ['失败提示', plan.content.failureMessage],
        ],
      ),
      '',
    ]),
    '## 8. 风险清单',
    '',
    table(
      ['风险', '类别', '概率', '影响', '等级', '预警指标', '缓解措施', '应急方案', '负责人'],
      experiment.risks.map((risk) => [
        risk.description,
        risk.category,
        risk.probability,
        risk.impact,
        risk.level,
        risk.warningMetric,
        risk.mitigation,
        risk.contingency,
        risk.owner,
      ]),
    ),
    '',
    '## 9. 决策规则',
    '',
    ...([
      ['成功标准', experiment.decisionRules.successCriteria],
      ['失败标准', experiment.decisionRules.failureCriteria],
      ['继续观察条件', experiment.decisionRules.observationCriteria],
      ['扩量条件', experiment.decisionRules.rampUpCriteria],
      ['全量条件', experiment.decisionRules.fullRolloutCriteria],
      ['回滚条件', experiment.decisionRules.rollbackCriteria],
      ['分群分析建议', experiment.decisionRules.segmentAnalysis],
      ['结果冲突处理', experiment.decisionRules.conflictResolution],
    ] as Array<[string, string[]]>).flatMap(([heading, items]) => [
      `### ${heading}`,
      '',
      list(items),
      '',
    ]),
    '## 10. 上线检查清单',
    '',
    ...experiment.launchChecklist.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.label}`),
    '',
    '## 11. 复盘模板',
    '',
    table(
      ['项目', '记录'],
      [
        ['实验背景', experiment.retrospective.background],
        ['原始假设', experiment.retrospective.originalHypothesis],
        ['实验设计', experiment.retrospective.experimentDesign],
        ['实际运行时间', experiment.retrospective.actualRunTime],
        ['样本量', experiment.retrospective.sampleSize],
        ['数据质量检查', experiment.retrospective.dataQualityChecks.join('；')],
        ['核心结果', experiment.retrospective.primaryResults],
        ['分群结果', experiment.retrospective.segmentResults],
        ['护栏指标', experiment.retrospective.guardrailResults],
        ['是否验证假设', experiment.retrospective.hypothesisValidated],
        ['异常与偏差', experiment.retrospective.anomaliesAndBiases],
        ['业务结论', experiment.retrospective.businessConclusion],
        ['是否全量', experiment.retrospective.rolloutDecision],
        ['后续行动', experiment.retrospective.nextActions.join('；')],
        ['新发现', experiment.retrospective.newLearnings.join('；')],
        ['下一轮实验', experiment.retrospective.nextExperiment],
      ],
    ),
    '',
    '---',
    '',
    '由 GrowthLab 生成。样本量为规划估算值，最终决策应结合效应大小、置信区间、护栏指标、成本与长期用户价值。',
    '',
  ].join('\n')
}

export function experimentToJson(experiment: GrowthExperiment): string {
  return JSON.stringify(stripSensitiveValues(experiment), null, 2)
}

export const generateMarkdown = experimentToMarkdown
export const generateMarkdownFilename = createMarkdownFilename
