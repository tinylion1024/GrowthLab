import type { GrowthExperiment } from '../types/experiment'
import type { ChatMessage, ExperimentModule } from '../lib/ai/types'
import { GROWTH_EXPERIMENT_SYSTEM_PROMPT } from './system'

const MODULE_LABELS: Record<ExperimentModule, string> = {
  overview: '实验概览',
  problemAnalysis: '问题拆解',
  hypotheses: '核心假设',
  design: '实验设计',
  variants: '实验分组',
  audience: '目标人群',
  metrics: '指标体系',
  samplePlan: '样本量与周期规划',
  copyPlans: '页面文案',
  risks: '风险清单',
  decisionRules: '决策规则',
  retrospective: '复盘模板',
}

export function buildModuleMessages(
  module: ExperimentModule,
  experiment: GrowthExperiment,
  instruction = '',
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `${GROWTH_EXPERIMENT_SYSTEM_PROMPT}

本次只优化“${MODULE_LABELS[module]}”。只返回该模块自身的 JSON 值，不要返回 GrowthExperiment 外层对象，也不要改写其他模块。`,
    },
    {
      role: 'user',
      content: `当前完整实验上下文：
${JSON.stringify(experiment)}

目标模块：${module}
用户补充要求：${instruction.trim() || '在不编造信息的前提下提高完整性、可执行性和表达清晰度。'}

只返回目标模块的数据结构。保留用户已编辑且与要求不冲突的事实。`,
    },
  ]
}

