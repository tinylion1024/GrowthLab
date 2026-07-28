import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import type { ExperimentDesignValue, VariantValue } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface ExperimentDesignFormProps {
  value: ExperimentDesignValue
  onChange: (value: ExperimentDesignValue) => void
  onAddVariant: () => void
}

export function ExperimentDesignForm({ value, onChange, onAddVariant }: ExperimentDesignFormProps) {
  const set = <Key extends keyof ExperimentDesignValue>(key: Key, next: ExperimentDesignValue[Key]) =>
    onChange({ ...value, [key]: next })
  const updateVariant = (id: string, patch: Partial<VariantValue>) =>
    set('variants', value.variants.map((variant) => variant.id === id ? { ...variant, ...patch } : variant))
  const trafficTotal = value.variants.reduce((sum, variant) => sum + Number(variant.trafficPercentage || 0), 0)

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="04 / EXPERIMENT ARCHITECTURE"
        title="实验设计"
        description="明确随机化、曝光与停止口径，让每个组只保留预期差异。"
      />
      <div className="gl-form-grid">
        <FormField label="实验单元" htmlFor="design-unit"><FieldInput id="design-unit" value={value.experimentUnit} onChange={(event) => set('experimentUnit', event.target.value)} /></FormField>
        <FormField label="随机化单位" htmlFor="design-randomization"><FieldInput id="design-randomization" value={value.randomizationUnit} onChange={(event) => set('randomizationUnit', event.target.value)} /></FormField>
        <FormField label="分流方式" htmlFor="design-allocation"><FieldInput id="design-allocation" value={value.allocationMethod} onChange={(event) => set('allocationMethod', event.target.value)} /></FormField>
        <FormField label="实验层 / 互斥说明" htmlFor="design-layer"><FieldInput id="design-layer" value={value.layerNotes} onChange={(event) => set('layerNotes', event.target.value)} /></FormField>
        <FormField label="触发条件" htmlFor="design-trigger"><FieldTextarea id="design-trigger" rows={2} value={value.triggerCondition} onChange={(event) => set('triggerCondition', event.target.value)} /></FormField>
        <FormField label="曝光口径" htmlFor="design-exposure"><FieldTextarea id="design-exposure" rows={2} value={value.exposureDefinition} onChange={(event) => set('exposureDefinition', event.target.value)} /></FormField>
        <FormField label="开始条件" htmlFor="design-start"><FieldTextarea id="design-start" rows={2} value={value.startCondition} onChange={(event) => set('startCondition', event.target.value)} /></FormField>
        <FormField label="停止条件" htmlFor="design-stop"><FieldTextarea id="design-stop" rows={2} value={value.stopCondition} onChange={(event) => set('stopCondition', event.target.value)} /></FormField>
      </div>

      <div className="gl-subsection-heading">
        <div><h3>实验分组</h3><p>当前总流量 {trafficTotal}%</p></div>
        <Button variant="secondary" size="sm" icon={<Plus size={15} />} onClick={onAddVariant}>添加实验组</Button>
      </div>
      {trafficTotal !== 100 && (
        <div className="gl-callout gl-callout--danger" role="alert">
          <AlertTriangle size={18} />
          <div><strong>流量分配合计为 {trafficTotal}%</strong><p>请调整各组比例，使总和等于 100%。</p></div>
        </div>
      )}
      <div className="gl-variant-grid">
        {value.variants.map((variant, index) => (
          <article className="gl-variant-card" key={variant.id}>
            <header>
              <span>{variant.type === 'control' ? 'CONTROL' : `TREATMENT ${String(index).padStart(2, '0')}`}</span>
              <button type="button" className="gl-icon-button gl-icon-button--danger" disabled={value.variants.length <= 2} onClick={() => set('variants', value.variants.filter((item) => item.id !== variant.id))} aria-label={`删除${variant.name}`}><Trash2 size={16} /></button>
            </header>
            <FormField label="组名" htmlFor={`variant-name-${variant.id}`}><FieldInput id={`variant-name-${variant.id}`} value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} /></FormField>
            <div className="gl-form-grid">
              <FormField label="组类型" htmlFor={`variant-type-${variant.id}`}><FieldSelect id={`variant-type-${variant.id}`} value={variant.type} onChange={(event) => updateVariant(variant.id, { type: event.target.value as VariantValue['type'] })}><option value="control">Control</option><option value="treatment">Treatment</option></FieldSelect></FormField>
              <FormField label="流量占比 %" htmlFor={`variant-traffic-${variant.id}`}><FieldInput id={`variant-traffic-${variant.id}`} type="number" min="0" max="100" value={variant.trafficPercentage} onChange={(event) => updateVariant(variant.id, { trafficPercentage: Number(event.target.value) })} /></FormField>
            </div>
            <FormField label="方案描述" htmlFor={`variant-description-${variant.id}`}><FieldTextarea id={`variant-description-${variant.id}`} rows={3} value={variant.description} onChange={(event) => updateVariant(variant.id, { description: event.target.value })} /></FormField>
            <FormField label="与对照组的唯一差异" htmlFor={`variant-difference-${variant.id}`}><FieldTextarea id={`variant-difference-${variant.id}`} rows={2} value={variant.uniqueDifference} onChange={(event) => updateVariant(variant.id, { uniqueDifference: event.target.value })} /></FormField>
            <FormField label="开发要求" htmlFor={`variant-dev-${variant.id}`}><FieldTextarea id={`variant-dev-${variant.id}`} rows={2} value={variant.developmentRequirements} onChange={(event) => updateVariant(variant.id, { developmentRequirements: event.target.value })} /></FormField>
            <FormField label="埋点要求" htmlFor={`variant-track-${variant.id}`}><FieldTextarea id={`variant-track-${variant.id}`} rows={2} value={variant.trackingRequirements} onChange={(event) => updateVariant(variant.id, { trackingRequirements: event.target.value })} /></FormField>
          </article>
        ))}
      </div>
    </div>
  )
}
