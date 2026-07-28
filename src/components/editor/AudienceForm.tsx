import type { AudienceValue } from '../types'
import { EditableList } from '../ui/EditableList'
import { FieldInput, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface AudienceFormProps {
  value: AudienceValue
  onChange: (value: AudienceValue) => void
}

export function AudienceForm({ value, onChange }: AudienceFormProps) {
  const set = <Key extends keyof AudienceValue>(key: Key, next: AudienceValue[Key]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="gl-module">
      <SectionHeader eyebrow="05 / AUDIENCE FRAME" title="目标人群" description="定义谁进入、谁被排除，以及何时真正算作实验触发。" />
      <div className="gl-form-grid">
        <EditableList label="纳入条件" values={value.inclusion} onChange={(next) => set('inclusion', next)} />
        <EditableList label="排除条件" values={value.exclusion} onChange={(next) => set('exclusion', next)} />
        <FormField label="新老用户" htmlFor="audience-lifecycle"><FieldInput id="audience-lifecycle" value={value.userLifecycle} onChange={(event) => set('userLifecycle', event.target.value)} /></FormField>
        <FormField label="实验触发时机" htmlFor="audience-trigger"><FieldInput id="audience-trigger" value={value.triggerMoment} onChange={(event) => set('triggerMoment', event.target.value)} /></FormField>
        <EditableList label="平台" values={value.platforms} onChange={(next) => set('platforms', next)} />
        <EditableList label="渠道" values={value.channels} onChange={(next) => set('channels', next)} />
        <EditableList label="地域" values={value.regions} onChange={(next) => set('regions', next)} />
        <EditableList label="用户分层" values={value.segments} onChange={(next) => set('segments', next)} />
        <FormField label="预估受众规模" htmlFor="audience-size">
          <FieldInput id="audience-size" value={value.estimatedSize} onChange={(event) => set('estimatedSize', event.target.value)} placeholder="没有数据时填写“待确认”" />
        </FormField>
        <FormField label="潜在污染风险" htmlFor="audience-contamination">
          <FieldTextarea id="audience-contamination" rows={3} value={value.contaminationRisk} onChange={(event) => set('contaminationRisk', event.target.value)} />
        </FormField>
      </div>
    </div>
  )
}
