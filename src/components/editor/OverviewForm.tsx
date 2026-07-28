import type { OverviewFormValue } from '../types'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface OverviewFormProps {
  value: OverviewFormValue
  onChange: (value: OverviewFormValue) => void
}

export function OverviewForm({ value, onChange }: OverviewFormProps) {
  const set = <Key extends keyof OverviewFormValue>(key: Key, next: OverviewFormValue[Key]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="01 / EXPERIMENT BRIEF"
        title="实验概览"
        description="用一页信息对齐实验目的、当前表现和交付责任。"
      />
      <div className="gl-form-grid">
        <FormField label="实验名称" htmlFor="overview-name" required className="gl-span-2">
          <FieldInput id="overview-name" value={value.name} onChange={(event) => set('name', event.target.value)} />
        </FormField>
        <FormField label="一句话摘要" htmlFor="overview-summary" className="gl-span-2" hint="给评审者的 15 秒版本">
          <FieldTextarea id="overview-summary" rows={2} value={value.summary} onChange={(event) => set('summary', event.target.value)} />
        </FormField>
        <FormField label="原始问题" htmlFor="overview-problem" className="gl-span-2">
          <FieldTextarea id="overview-problem" rows={3} value={value.originalProblem} onChange={(event) => set('originalProblem', event.target.value)} />
        </FormField>
        <FormField label="业务背景" htmlFor="overview-background" className="gl-span-2">
          <FieldTextarea id="overview-background" rows={3} value={value.background} onChange={(event) => set('background', event.target.value)} />
        </FormField>
        <FormField label="当前表现" htmlFor="overview-current">
          <FieldInput id="overview-current" value={value.currentPerformance} onChange={(event) => set('currentPerformance', event.target.value)} />
        </FormField>
        <FormField label="目标表现" htmlFor="overview-target">
          <FieldInput id="overview-target" value={value.targetPerformance} onChange={(event) => set('targetPerformance', event.target.value)} />
        </FormField>
        <FormField label="实验类型" htmlFor="overview-type">
          <FieldSelect id="overview-type" value={value.experimentType} onChange={(event) => set('experimentType', event.target.value)}>
            {['A/B 测试', '多变量实验', '灰度实验', '准实验', '待确认'].map((item) => <option key={item}>{item}</option>)}
          </FieldSelect>
        </FormField>
        <FormField label="负责人" htmlFor="overview-owner">
          <FieldInput id="overview-owner" value={value.owner} onChange={(event) => set('owner', event.target.value)} placeholder="待确认" />
        </FormField>
        <FormField label="优先级" htmlFor="overview-priority">
          <FieldSelect id="overview-priority" value={value.priority} onChange={(event) => set('priority', event.target.value as OverviewFormValue['priority'])}>
            <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
          </FieldSelect>
        </FormField>
        <FormField label="标签" htmlFor="overview-tags" hint="使用逗号分隔">
          <FieldInput id="overview-tags" value={value.tags.join('，')} onChange={(event) => set('tags', event.target.value.split(/[，,]/).map((item) => item.trim()).filter(Boolean))} />
        </FormField>
      </div>
    </div>
  )
}
