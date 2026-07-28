import { ArrowDown, ArrowUp, Plus, Sparkles, Star, Trash2 } from 'lucide-react'
import type { HypothesisValue, Priority } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface HypothesesFormProps {
  value: HypothesisValue[]
  optimizingId?: string
  onChange: (value: HypothesisValue[]) => void
  onOptimize: (id: string) => void
  onAdd: () => void
}

const levelOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
] as const

export function HypothesesForm({ value, optimizingId, onChange, onOptimize, onAdd }: HypothesesFormProps) {
  const update = (id: string, patch: Partial<HypothesisValue>) =>
    onChange(value.map((item) => item.id === id ? { ...item, ...patch } : item))

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    const currentItem = next[index]
    const targetItem = next[target]
    if (!currentItem || !targetItem) return
    next[index] = targetItem
    next[target] = currentItem
    onChange(next.map((item, itemIndex) => ({ ...item, priority: itemIndex + 1 })))
  }

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="03 / HYPOTHESIS STACK"
        title="核心假设"
        description="保持 If / Then / Because 链路完整，每条假设只验证一个主要变量。"
        action={<Button icon={<Plus size={16} />} onClick={onAdd}>新增假设</Button>}
      />
      <div className="gl-card-stack">
        {value.map((hypothesis, index) => (
          <article className={`gl-edit-card ${hypothesis.isPrimary ? 'is-primary' : ''}`} key={hypothesis.id}>
            <header className="gl-edit-card__header">
              <div className="gl-edit-card__number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span>HYPOTHESIS</span>
                <h3>{hypothesis.name || '未命名假设'}</h3>
              </div>
              <div className="gl-edit-card__actions">
                <button className={`gl-icon-button ${hypothesis.isPrimary ? 'is-active' : ''}`} type="button" onClick={() => onChange(value.map((item) => ({ ...item, isPrimary: item.id === hypothesis.id })))} aria-label="设为主假设" title="设为主假设"><Star size={17} /></button>
                <button className="gl-icon-button" type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="上移"><ArrowUp size={17} /></button>
                <button className="gl-icon-button" type="button" disabled={index === value.length - 1} onClick={() => move(index, 1)} aria-label="下移"><ArrowDown size={17} /></button>
                <button className="gl-icon-button gl-icon-button--danger" type="button" disabled={value.length <= 1} onClick={() => onChange(value.filter((item) => item.id !== hypothesis.id))} aria-label="删除假设"><Trash2 size={17} /></button>
              </div>
            </header>
            <div className="gl-form-grid">
              <FormField label="假设名称" htmlFor={`hypothesis-name-${hypothesis.id}`} className="gl-span-2">
                <FieldInput id={`hypothesis-name-${hypothesis.id}`} value={hypothesis.name} onChange={(event) => update(hypothesis.id, { name: event.target.value })} />
              </FormField>
              <FormField label="如果 If" htmlFor={`hypothesis-if-${hypothesis.id}`} className="gl-span-2">
                <FieldTextarea id={`hypothesis-if-${hypothesis.id}`} rows={2} value={hypothesis.if} onChange={(event) => update(hypothesis.id, { if: event.target.value })} />
              </FormField>
              <FormField label="那么 Then" htmlFor={`hypothesis-then-${hypothesis.id}`}>
                <FieldTextarea id={`hypothesis-then-${hypothesis.id}`} rows={2} value={hypothesis.then} onChange={(event) => update(hypothesis.id, { then: event.target.value })} />
              </FormField>
              <FormField label="因为 Because" htmlFor={`hypothesis-because-${hypothesis.id}`}>
                <FieldTextarea id={`hypothesis-because-${hypothesis.id}`} rows={2} value={hypothesis.because} onChange={(event) => update(hypothesis.id, { because: event.target.value })} />
              </FormField>
              <FormField label="用户洞察" htmlFor={`hypothesis-insight-${hypothesis.id}`}>
                <FieldTextarea id={`hypothesis-insight-${hypothesis.id}`} rows={2} value={hypothesis.insight} onChange={(event) => update(hypothesis.id, { insight: event.target.value })} />
              </FormField>
              <FormField label="支撑证据" htmlFor={`hypothesis-evidence-${hypothesis.id}`}>
                <FieldTextarea id={`hypothesis-evidence-${hypothesis.id}`} rows={2} value={hypothesis.evidence} onChange={(event) => update(hypothesis.id, { evidence: event.target.value })} />
              </FormField>
              <div className="gl-level-grid gl-span-2">
                {(['confidence', 'impact', 'cost'] as const).map((field) => (
                  <FormField key={field} label={{ confidence: '信心等级', impact: '影响程度', cost: '实施成本' }[field]} htmlFor={`hypothesis-${field}-${hypothesis.id}`}>
                    <FieldSelect id={`hypothesis-${field}-${hypothesis.id}`} value={hypothesis[field]} onChange={(event) => update(hypothesis.id, { [field]: event.target.value as Priority })}>
                      {levelOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                    </FieldSelect>
                  </FormField>
                ))}
              </div>
              <FormField label="验证方式" htmlFor={`hypothesis-validation-${hypothesis.id}`} className="gl-span-2">
                <FieldTextarea id={`hypothesis-validation-${hypothesis.id}`} rows={2} value={hypothesis.validation} onChange={(event) => update(hypothesis.id, { validation: event.target.value })} />
              </FormField>
            </div>
            <footer className="gl-edit-card__footer">
              {hypothesis.isPrimary && <span><Star size={14} fill="currentColor" /> 主假设</span>}
              <Button variant="ghost" size="sm" icon={<Sparkles size={15} />} loading={optimizingId === hypothesis.id} onClick={() => onOptimize(hypothesis.id)}>
                AI 改写此条
              </Button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
