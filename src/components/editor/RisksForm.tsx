import { Plus, Trash2 } from 'lucide-react'
import type { Priority, RiskLevel, RiskValue } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusBadge } from '../ui/StatusBadge'

export interface RisksFormProps {
  value: RiskValue[]
  onChange: (value: RiskValue[]) => void
  onAdd: () => void
}

const levels = [{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }] as const
const riskLevels = [...levels, { value: 'critical', label: '严重' }] as const

export function RisksForm({ value, onChange, onAdd }: RisksFormProps) {
  const update = (id: string, patch: Partial<RiskValue>) =>
    onChange(value.map((risk) => risk.id === id ? { ...risk, ...patch } : risk))

  return (
    <div className="gl-module">
      <SectionHeader eyebrow="09 / RISK REGISTER" title="风险清单" description="风险必须连接到预警信号、缓解动作和明确负责人。" action={<Button icon={<Plus size={16} />} onClick={onAdd}>新增风险</Button>} />
      <div className="gl-risk-matrix">
        {value.map((risk, index) => (
          <article className={`gl-risk-row gl-risk-row--${risk.level}`} key={risk.id}>
            <header>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <StatusBadge tone={risk.level === 'high' ? 'danger' : risk.level === 'medium' ? 'warning' : 'neutral'}>{risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险'}</StatusBadge>
              <h3>{risk.description || '未命名风险'}</h3>
              <button className="gl-icon-button gl-icon-button--danger" type="button" disabled={value.length <= 1} onClick={() => onChange(value.filter((item) => item.id !== risk.id))} aria-label={`删除${risk.description}`}><Trash2 size={16} /></button>
            </header>
            <div className="gl-form-grid">
              <FormField label="风险描述" htmlFor={`risk-description-${risk.id}`} className="gl-span-2"><FieldTextarea id={`risk-description-${risk.id}`} rows={2} value={risk.description} onChange={(event) => update(risk.id, { description: event.target.value })} /></FormField>
              <FormField label="风险类别" htmlFor={`risk-category-${risk.id}`}><FieldInput id={`risk-category-${risk.id}`} value={risk.category} onChange={(event) => update(risk.id, { category: event.target.value })} /></FormField>
              <FormField label="负责人" htmlFor={`risk-owner-${risk.id}`}><FieldInput id={`risk-owner-${risk.id}`} value={risk.owner} onChange={(event) => update(risk.id, { owner: event.target.value })} placeholder="待确认" /></FormField>
              {(['probability', 'impact'] as const).map((field) => (
                <FormField key={field} label={{ probability: '发生概率', impact: '影响程度' }[field]} htmlFor={`risk-${field}-${risk.id}`}>
                  <FieldSelect id={`risk-${field}-${risk.id}`} value={risk[field]} onChange={(event) => update(risk.id, { [field]: event.target.value as Priority })}>{levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</FieldSelect>
                </FormField>
              ))}
              <FormField label="风险等级" htmlFor={`risk-level-${risk.id}`}>
                <FieldSelect id={`risk-level-${risk.id}`} value={risk.level} onChange={(event) => update(risk.id, { level: event.target.value as RiskLevel })}>{riskLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</FieldSelect>
              </FormField>
              <FormField label="预警指标" htmlFor={`risk-warning-${risk.id}`}><FieldInput id={`risk-warning-${risk.id}`} value={risk.warningMetric} onChange={(event) => update(risk.id, { warningMetric: event.target.value })} /></FormField>
              <FormField label="缓解措施" htmlFor={`risk-mitigation-${risk.id}`}><FieldTextarea id={`risk-mitigation-${risk.id}`} rows={2} value={risk.mitigation} onChange={(event) => update(risk.id, { mitigation: event.target.value })} /></FormField>
              <FormField label="应急方案" htmlFor={`risk-contingency-${risk.id}`}><FieldTextarea id={`risk-contingency-${risk.id}`} rows={2} value={risk.contingency} onChange={(event) => update(risk.id, { contingency: event.target.value })} /></FormField>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
