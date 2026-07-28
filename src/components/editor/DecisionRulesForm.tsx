import type { DecisionRulesValue } from '../types'
import { FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface DecisionRulesFormProps {
  value: DecisionRulesValue
  onChange: (value: DecisionRulesValue) => void
}

const fields: Array<{ key: keyof DecisionRulesValue; label: string; hint: string }> = [
  { key: 'success', label: '实验成功标准', hint: '同时考虑效应量、置信区间与护栏' },
  { key: 'failure', label: '实验失败标准', hint: '明确不可接受的结果' },
  { key: 'observe', label: '继续观察条件', hint: '数据不足或结果不稳定时' },
  { key: 'rampUp', label: '扩量条件', hint: '分阶段提高流量的门槛' },
  { key: 'fullLaunch', label: '全量条件', hint: '业务价值与长期影响' },
  { key: 'rollback', label: '回滚条件', hint: '护栏恶化或技术事故' },
  { key: 'segmentAnalysis', label: '分群分析建议', hint: '避免只看总体平均' },
  { key: 'conflictResolution', label: '结果冲突时如何决策', hint: '核心指标与护栏冲突时的优先级' },
]

export function DecisionRulesForm({ value, onChange }: DecisionRulesFormProps) {
  return (
    <div className="gl-module">
      <SectionHeader eyebrow="10 / DECISION CONTRACT" title="决策规则" description="在看到结果前先写下判断准则，减少事后解释与选择性汇报。" />
      <div className="gl-decision-grid">
        {fields.map((field, index) => (
          <FormField key={field.key} label={`${String(index + 1).padStart(2, '0')} / ${field.label}`} htmlFor={`decision-${field.key}`} hint={field.hint}>
            <FieldTextarea id={`decision-${field.key}`} rows={4} value={value[field.key]} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} />
          </FormField>
        ))}
      </div>
    </div>
  )
}
