import { ArrowRight, ChevronDown, FlaskConical, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { GrowthContextInput } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'

const EMPTY_CONTEXT: GrowthContextInput = {
  businessScene: '',
  currentValue: '',
  targetValue: '',
  metricType: '点击率',
  dailyTraffic: '',
  trafficPercentage: '100',
  alpha: '0.05',
  power: '0.8',
  constraints: '',
  resources: '',
  deadline: '',
}

const EXAMPLES = [
  '新用户任务页点击率从 8% 提升到 12%',
  '提升资料领取落地页的表单提交率',
  '降低完成首单后用户的 7 日流失率',
]

export interface ExperimentComposerProps {
  generating?: boolean
  initialProblem?: string
  onGenerate: (problem: string, context: GrowthContextInput) => void
  onUseDemo: () => void
}

export function ExperimentComposer({
  generating = false,
  initialProblem = '',
  onGenerate,
  onUseDemo,
}: ExperimentComposerProps) {
  const [problem, setProblem] = useState(initialProblem)
  const [context, setContext] = useState(EMPTY_CONTEXT)
  const [showContext, setShowContext] = useState(false)
  const [error, setError] = useState('')

  const updateContext = <Key extends keyof GrowthContextInput>(
    key: Key,
    value: GrowthContextInput[Key],
  ) => setContext((current) => ({ ...current, [key]: value }))

  const submit = () => {
    const normalized = problem.trim()
    if (!normalized) {
      setError('请先描述一个需要改善的增长问题。')
      return
    }
    if (normalized.length < 8) {
      setError('再具体一点：建议包含目标人群、页面或指标。')
      return
    }
    setError('')
    onGenerate(normalized, context)
  }

  return (
    <section className="gl-composer" aria-labelledby="composer-title">
      <div className="gl-composer__stamp" aria-hidden="true">
        LAB NOTE / 001
      </div>
      <div className="gl-composer__heading">
        <span className="gl-kicker"><FlaskConical size={16} /> 从问题开始</span>
        <h2 id="composer-title">今天想验证什么？</h2>
        <p>先用一句话描述，不需要提前整理成完整需求。</p>
      </div>
      <div className={`gl-composer__input ${error ? 'has-error' : ''}`}>
        <textarea
          value={problem}
          onChange={(event) => {
            setProblem(event.target.value)
            if (error) setError('')
          }}
          aria-label="增长问题"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'problem-error' : undefined}
          placeholder="例如：新用户任务页点击率只有 8%，希望提升到 12%。"
          rows={4}
        />
        <span className="gl-composer__counter">{problem.trim().length} 字</span>
      </div>
      {error && <p className="gl-composer__error" id="problem-error" role="alert">{error}</p>}

      <div className="gl-example-list" aria-label="问题示例">
        <span>试试这些：</span>
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setProblem(example)}>
            {example}
          </button>
        ))}
      </div>

      <div className="gl-composer__context">
        <button
          type="button"
          className="gl-context-toggle"
          aria-expanded={showContext}
          onClick={() => setShowContext((current) => !current)}
        >
          <span>
            <strong>补充实验背景</strong>
            <small>可选，信息越具体，首版方案越可靠</small>
          </span>
          <ChevronDown className={showContext ? 'is-open' : ''} size={19} />
        </button>
        {showContext && (
          <div className="gl-context-panel">
            <FormField label="业务场景" htmlFor="business-scene" className="gl-span-2">
              <FieldTextarea
                id="business-scene"
                value={context.businessScene}
                onChange={(event) => updateContext('businessScene', event.target.value)}
                placeholder="用户在什么场景中遇到问题？"
                rows={2}
              />
            </FormField>
            <FormField label="当前指标值" htmlFor="current-value">
              <FieldInput id="current-value" value={context.currentValue} onChange={(event) => updateContext('currentValue', event.target.value)} placeholder="例如 8%" />
            </FormField>
            <FormField label="目标指标值" htmlFor="target-value">
              <FieldInput id="target-value" value={context.targetValue} onChange={(event) => updateContext('targetValue', event.target.value)} placeholder="例如 12%" />
            </FormField>
            <FormField label="指标类型" htmlFor="metric-type">
              <FieldSelect id="metric-type" value={context.metricType} onChange={(event) => updateContext('metricType', event.target.value)}>
                {['转化率', '点击率', '留存率', '客单价', '自定义'].map((type) => <option key={type}>{type}</option>)}
              </FieldSelect>
            </FormField>
            <FormField label="每日预计人数" htmlFor="daily-traffic">
              <FieldInput id="daily-traffic" inputMode="numeric" value={context.dailyTraffic} onChange={(event) => updateContext('dailyTraffic', event.target.value)} placeholder="例如 5000" />
            </FormField>
            <FormField label="实验流量比例" htmlFor="traffic-percentage">
              <FieldInput id="traffic-percentage" inputMode="decimal" value={context.trafficPercentage} onChange={(event) => updateContext('trafficPercentage', event.target.value)} />
            </FormField>
            <FormField label="显著性水平 Alpha" htmlFor="alpha">
              <FieldInput id="alpha" inputMode="decimal" value={context.alpha} onChange={(event) => updateContext('alpha', event.target.value)} />
            </FormField>
            <FormField label="Statistical Power" htmlFor="power">
              <FieldInput id="power" inputMode="decimal" value={context.power} onChange={(event) => updateContext('power', event.target.value)} />
            </FormField>
            <FormField label="最晚结束时间" htmlFor="deadline">
              <FieldInput id="deadline" type="date" value={context.deadline} onChange={(event) => updateContext('deadline', event.target.value)} />
            </FormField>
            <FormField label="业务约束" htmlFor="constraints">
              <FieldTextarea id="constraints" value={context.constraints} onChange={(event) => updateContext('constraints', event.target.value)} placeholder="合规、成本或时间限制" rows={2} />
            </FormField>
            <FormField label="可用资源" htmlFor="resources">
              <FieldTextarea id="resources" value={context.resources} onChange={(event) => updateContext('resources', event.target.value)} placeholder="研发、设计、数据支持" rows={2} />
            </FormField>
          </div>
        )}
      </div>

      <div className="gl-composer__actions">
        <div className="gl-composer__trust">
          <Sparkles size={16} aria-hidden="true" />
          <span>AI 生成首版，你负责判断与修订</span>
        </div>
        <div>
          <Button variant="secondary" onClick={onUseDemo}>使用示例体验</Button>
          <Button
            size="lg"
            icon={<ArrowRight size={18} />}
            loading={generating}
            onClick={submit}
          >
            {generating ? '正在搭建实验…' : '生成实验方案'}
          </Button>
        </div>
      </div>
    </section>
  )
}
