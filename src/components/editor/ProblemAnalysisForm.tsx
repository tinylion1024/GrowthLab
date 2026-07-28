import { AlertCircle } from 'lucide-react'
import type { ProblemAnalysisValue } from '../types'
import { EditableList } from '../ui/EditableList'
import { FieldInput, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface ProblemAnalysisFormProps {
  value: ProblemAnalysisValue
  onChange: (value: ProblemAnalysisValue) => void
}

export function ProblemAnalysisForm({ value, onChange }: ProblemAnalysisFormProps) {
  const set = <Key extends keyof ProblemAnalysisValue>(key: Key, next: ProblemAnalysisValue[Key]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="gl-module">
      <SectionHeader
        eyebrow="02 / PROBLEM MAP"
        title="问题拆解"
        description="把观察到的现象与推测原因分开，避免方案先于问题。"
      />
      {value.informationGaps.length > 0 && (
        <div className="gl-callout gl-callout--warning">
          <AlertCircle size={19} />
          <div><strong>{value.informationGaps.length} 项信息待确认</strong><p>这些内容不会由 AI 自动编造，建议在评审前补齐。</p></div>
        </div>
      )}
      <div className="gl-form-grid">
        <FormField label="现象" htmlFor="problem-phenomenon" className="gl-span-2">
          <FieldTextarea id="problem-phenomenon" rows={3} value={value.phenomenon} onChange={(event) => set('phenomenon', event.target.value)} />
        </FormField>
        <FormField label="目标" htmlFor="problem-goal">
          <FieldInput id="problem-goal" value={value.goal} onChange={(event) => set('goal', event.target.value)} />
        </FormField>
        <FormField label="目标人群" htmlFor="problem-audience">
          <FieldInput id="problem-audience" value={value.audience} onChange={(event) => set('audience', event.target.value)} />
        </FormField>
        <div className="gl-span-2"><EditableList label="用户行为路径" values={value.behaviorPath} onChange={(next) => set('behaviorPath', next)} /></div>
        <EditableList label="可能原因" values={value.possibleCauses} onChange={(next) => set('possibleCauses', next)} />
        <EditableList label="可控变量" values={value.controllableVariables} onChange={(next) => set('controllableVariables', next)} />
        <EditableList label="不可控变量" values={value.uncontrollableVariables} onChange={(next) => set('uncontrollableVariables', next)} />
        <EditableList label="当前信息缺口" values={value.informationGaps} onChange={(next) => set('informationGaps', next)} emptyLabel="没有待确认信息" />
      </div>
    </div>
  )
}
