import { Plus, Trash2 } from 'lucide-react'
import type { CopyPlanValue } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface CopyPlansFormProps {
  value: CopyPlanValue[]
  onChange: (value: CopyPlanValue[]) => void
  onAdd: () => void
}

export function CopyPlansForm({ value, onChange, onAdd }: CopyPlansFormProps) {
  const update = (id: string, patch: Partial<CopyPlanValue>) =>
    onChange(value.map((plan) => plan.id === id ? { ...plan, ...patch } : plan))

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="08 / COPY DIRECTIONS"
        title="页面文案"
        description="每个方向对应一条假设，并保留清晰、真实、可以兑现的承诺。"
        action={<Button icon={<Plus size={16} />} onClick={onAdd}>添加方向</Button>}
      />
      <div className="gl-copy-tabs" role="tablist" aria-label="文案方向">
        {value.map((plan, index) => <span key={plan.id}>{String(index + 1).padStart(2, '0')} / {plan.direction}</span>)}
      </div>
      <div className="gl-card-stack">
        {value.map((plan, index) => (
          <article className="gl-copy-card" key={plan.id}>
            <header>
              <div><span>DIRECTION {String(index + 1).padStart(2, '0')}</span><h3>{plan.direction || '未命名方向'}</h3></div>
              <button className="gl-icon-button gl-icon-button--danger" type="button" disabled={value.length <= 1} onClick={() => onChange(value.filter((item) => item.id !== plan.id))} aria-label={`删除${plan.direction}`}><Trash2 size={17} /></button>
            </header>
            <div className="gl-copy-preview">
              <span>LIVE COPY PREVIEW</span>
              <h4>{plan.title || '页面标题'}</h4>
              <p>{plan.subtitle || '这里显示副标题和辅助说明。'}</p>
              <button type="button" tabIndex={-1}>{plan.cta || '行动按钮'}</button>
              <small>{plan.supportingText}</small>
            </div>
            <div className="gl-form-grid">
              <FormField label="文案方向" htmlFor={`copy-direction-${plan.id}`}><FieldInput id={`copy-direction-${plan.id}`} value={plan.direction} onChange={(event) => update(plan.id, { direction: event.target.value })} /></FormField>
              <FormField label="策略类型" htmlFor={`copy-strategy-${plan.id}`}><FieldSelect id={`copy-strategy-${plan.id}`} value={plan.strategy} onChange={(event) => update(plan.id, { strategy: event.target.value as CopyPlanValue['strategy'] })}><option value="direct-benefit">直接利益</option><option value="lower-friction">降低阻力</option><option value="social-proof">社会证明</option><option value="custom">自定义</option></FieldSelect></FormField>
              <FormField label="对应假设" htmlFor={`copy-hypothesis-${plan.id}`}><FieldInput id={`copy-hypothesis-${plan.id}`} value={plan.hypothesis} onChange={(event) => update(plan.id, { hypothesis: event.target.value })} /></FormField>
              <FormField label="页面标题" htmlFor={`copy-title-${plan.id}`}><FieldInput id={`copy-title-${plan.id}`} value={plan.title} onChange={(event) => update(plan.id, { title: event.target.value })} /></FormField>
              <FormField label="副标题" htmlFor={`copy-subtitle-${plan.id}`}><FieldInput id={`copy-subtitle-${plan.id}`} value={plan.subtitle} onChange={(event) => update(plan.id, { subtitle: event.target.value })} /></FormField>
              <FormField label="核心利益点" htmlFor={`copy-benefit-${plan.id}`}><FieldTextarea id={`copy-benefit-${plan.id}`} rows={2} value={plan.benefit} onChange={(event) => update(plan.id, { benefit: event.target.value })} /></FormField>
              <FormField label="CTA" htmlFor={`copy-cta-${plan.id}`}><FieldInput id={`copy-cta-${plan.id}`} value={plan.cta} onChange={(event) => update(plan.id, { cta: event.target.value })} /></FormField>
              <FormField label="辅助说明" htmlFor={`copy-support-${plan.id}`}><FieldTextarea id={`copy-support-${plan.id}`} rows={2} value={plan.supportingText} onChange={(event) => update(plan.id, { supportingText: event.target.value })} /></FormField>
              <FormField label="风险提示" htmlFor={`copy-risk-notice-${plan.id}`}><FieldTextarea id={`copy-risk-notice-${plan.id}`} rows={2} value={plan.riskNotice} onChange={(event) => update(plan.id, { riskNotice: event.target.value })} /></FormField>
              <FormField label="空状态" htmlFor={`copy-empty-${plan.id}`}><FieldInput id={`copy-empty-${plan.id}`} value={plan.emptyState} onChange={(event) => update(plan.id, { emptyState: event.target.value })} /></FormField>
              <FormField label="成功提示" htmlFor={`copy-success-${plan.id}`}><FieldInput id={`copy-success-${plan.id}`} value={plan.successMessage} onChange={(event) => update(plan.id, { successMessage: event.target.value })} /></FormField>
              <FormField label="失败提示" htmlFor={`copy-error-${plan.id}`}><FieldInput id={`copy-error-${plan.id}`} value={plan.errorMessage} onChange={(event) => update(plan.id, { errorMessage: event.target.value })} /></FormField>
              <FormField label="使用场景" htmlFor={`copy-scenario-${plan.id}`}><FieldInput id={`copy-scenario-${plan.id}`} value={plan.scenario} onChange={(event) => update(plan.id, { scenario: event.target.value })} /></FormField>
              <FormField label="预期影响" htmlFor={`copy-impact-${plan.id}`}><FieldTextarea id={`copy-impact-${plan.id}`} rows={2} value={plan.expectedImpact} onChange={(event) => update(plan.id, { expectedImpact: event.target.value })} /></FormField>
              <FormField label="潜在风险" htmlFor={`copy-potential-risk-${plan.id}`}><FieldTextarea id={`copy-potential-risk-${plan.id}`} rows={2} value={plan.potentialRisk} onChange={(event) => update(plan.id, { potentialRisk: event.target.value })} /></FormField>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
