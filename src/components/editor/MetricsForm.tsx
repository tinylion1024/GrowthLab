import { Plus, Trash2 } from 'lucide-react'
import type { MetricCategory, MetricValue, MetricValueType } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusBadge } from '../ui/StatusBadge'

export interface MetricsFormProps {
  value: MetricValue[]
  onChange: (value: MetricValue[]) => void
  onAdd: () => void
}

const categoryMeta: Record<MetricCategory, { label: string; tone: 'info' | 'success' | 'warning' | 'neutral' }> = {
  primary: { label: '核心指标', tone: 'success' },
  secondary: { label: '次要指标', tone: 'info' },
  guardrail: { label: '护栏指标', tone: 'warning' },
  diagnostic: { label: '诊断指标', tone: 'neutral' },
}

const valueTypeLabels: Record<MetricValueType, string> = {
  conversion_rate: '转化率',
  click_rate: '点击率',
  retention_rate: '留存率',
  average_order_value: '客单价',
  count: '计数',
  custom: '自定义',
}

export function MetricsForm({ value, onChange, onAdd }: MetricsFormProps) {
  const update = (id: string, patch: Partial<MetricValue>) =>
    onChange(value.map((metric) => metric.id === id ? { ...metric, ...patch } : metric))

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="06 / MEASUREMENT SYSTEM"
        title="指标体系"
        description="核心指标判断价值，护栏指标约束副作用，诊断指标解释变化发生在哪里。"
        action={<Button icon={<Plus size={16} />} onClick={onAdd}>新增指标</Button>}
      />
      <div className="gl-metric-list">
        {value.map((metric, index) => (
          <article className="gl-metric-card" key={metric.id}>
            <header>
              <div>
                <span className="gl-metric-card__number">{String(index + 1).padStart(2, '0')}</span>
                <StatusBadge tone={categoryMeta[metric.category].tone}>{categoryMeta[metric.category].label}</StatusBadge>
                <h3>{metric.name || '未命名指标'}</h3>
              </div>
              <button className="gl-icon-button gl-icon-button--danger" type="button" disabled={value.length <= 1} onClick={() => onChange(value.filter((item) => item.id !== metric.id))} aria-label={`删除${metric.name}`}><Trash2 size={17} /></button>
            </header>
            <div className="gl-form-grid">
              <FormField label="名称" htmlFor={`metric-name-${metric.id}`}><FieldInput id={`metric-name-${metric.id}`} value={metric.name} onChange={(event) => update(metric.id, { name: event.target.value })} /></FormField>
              <FormField label="类型" htmlFor={`metric-category-${metric.id}`}><FieldSelect id={`metric-category-${metric.id}`} value={metric.category} onChange={(event) => update(metric.id, { category: event.target.value as MetricCategory })}>{Object.entries(categoryMeta).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</FieldSelect></FormField>
              <FormField label="数值类型" htmlFor={`metric-value-type-${metric.id}`}><FieldSelect id={`metric-value-type-${metric.id}`} value={metric.valueType} onChange={(event) => update(metric.id, { valueType: event.target.value as MetricValueType })}>{Object.entries(valueTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</FieldSelect></FormField>
              <FormField label="定义" htmlFor={`metric-definition-${metric.id}`} className="gl-span-2"><FieldTextarea id={`metric-definition-${metric.id}`} rows={2} value={metric.definition} onChange={(event) => update(metric.id, { definition: event.target.value })} /></FormField>
              <FormField label="计算公式" htmlFor={`metric-formula-${metric.id}`} className="gl-span-2"><FieldInput id={`metric-formula-${metric.id}`} value={metric.formula} onChange={(event) => update(metric.id, { formula: event.target.value })} /></FormField>
              <FormField label="分子" htmlFor={`metric-numerator-${metric.id}`}><FieldInput id={`metric-numerator-${metric.id}`} value={metric.numerator} onChange={(event) => update(metric.id, { numerator: event.target.value })} /></FormField>
              <FormField label="分母" htmlFor={`metric-denominator-${metric.id}`}><FieldInput id={`metric-denominator-${metric.id}`} value={metric.denominator} onChange={(event) => update(metric.id, { denominator: event.target.value })} /></FormField>
              <FormField label="统计窗口" htmlFor={`metric-window-${metric.id}`}><FieldInput id={`metric-window-${metric.id}`} value={metric.window} onChange={(event) => update(metric.id, { window: event.target.value })} /></FormField>
              <FormField label="数据来源" htmlFor={`metric-source-${metric.id}`}><FieldInput id={`metric-source-${metric.id}`} value={metric.source} onChange={(event) => update(metric.id, { source: event.target.value })} /></FormField>
              <FormField label="期望方向" htmlFor={`metric-direction-${metric.id}`}><FieldSelect id={`metric-direction-${metric.id}`} value={metric.direction} onChange={(event) => update(metric.id, { direction: event.target.value as MetricValue['direction'] })}><option value="increase">提升</option><option value="decrease">降低</option><option value="neutral">保持稳定</option></FieldSelect></FormField>
              <FormField label="最小可检测效应 MDE" htmlFor={`metric-mde-${metric.id}`}><FieldInput id={`metric-mde-${metric.id}`} value={metric.mde} onChange={(event) => update(metric.id, { mde: event.target.value })} /></FormField>
              <label className="gl-check-row">
                <input type="checkbox" checked={metric.isTracked} onChange={(event) => update(metric.id, { isTracked: event.target.checked })} />
                <span><strong>已有埋点</strong><small>上线前仍需完成数据验收</small></span>
              </label>
              <FormField label="注意事项" htmlFor={`metric-notes-${metric.id}`}><FieldTextarea id={`metric-notes-${metric.id}`} rows={2} value={metric.notes} onChange={(event) => update(metric.id, { notes: event.target.value })} /></FormField>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
