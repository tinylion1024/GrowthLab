import type { RetrospectiveValue } from '../types'
import { FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface RetrospectiveFormProps {
  value: RetrospectiveValue
  onChange: (value: RetrospectiveValue) => void
}

const retrospectiveFields: Array<{ key: keyof RetrospectiveValue; label: string }> = [
  { key: 'background', label: '实验背景' }, { key: 'originalHypothesis', label: '原始假设' },
  { key: 'design', label: '实验设计' }, { key: 'actualDuration', label: '实际运行时间' },
  { key: 'sampleSize', label: '样本量' }, { key: 'dataQuality', label: '数据质量检查' },
  { key: 'primaryResult', label: '核心结果' }, { key: 'segmentResult', label: '分群结果' },
  { key: 'guardrailResult', label: '护栏指标' }, { key: 'hypothesisValidated', label: '是否验证假设' },
  { key: 'anomalies', label: '异常与偏差' }, { key: 'businessConclusion', label: '业务结论' },
  { key: 'launchDecision', label: '是否全量' }, { key: 'nextActions', label: '后续行动' },
  { key: 'discoveries', label: '新发现' }, { key: 'nextExperiment', label: '下一轮实验' },
]

export function RetrospectiveForm({ value, onChange }: RetrospectiveFormProps) {
  return (
    <div className="gl-module">
      <SectionHeader eyebrow="11 / LEARNING LOG" title="复盘模板" description="实验结束后，记录真正获得的知识，而不只留下显著或不显著。" />
      <div className="gl-retro-grid">
        {retrospectiveFields.map((field, index) => (
          <FormField key={field.key} label={`${String(index + 1).padStart(2, '0')} / ${field.label}`} htmlFor={`retro-${field.key}`}>
            <FieldTextarea id={`retro-${field.key}`} rows={3} value={value[field.key]} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} placeholder={['actualDuration', 'sampleSize', 'primaryResult', 'segmentResult', 'guardrailResult', 'hypothesisValidated', 'anomalies', 'businessConclusion', 'launchDecision', 'discoveries', 'nextExperiment'].includes(field.key) ? '实验结束后填写' : undefined} />
          </FormField>
        ))}
      </div>
    </div>
  )
}
