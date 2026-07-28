import { CheckCircle2, Circle } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ChecklistItem } from '../types'
import { SectionHeader } from '../ui/SectionHeader'

export interface LaunchChecklistProps {
  value: ChecklistItem[]
  onChange: (value: ChecklistItem[]) => void
}

export function LaunchChecklist({ value, onChange }: LaunchChecklistProps) {
  const checked = value.filter((item) => item.checked).length
  const completion = value.length ? Math.round((checked / value.length) * 100) : 0
  return (
    <div className="gl-module">
      <SectionHeader eyebrow="12 / RELEASE GATE" title="上线检查清单" description="每一项都应有可验证的完成证据；勾选状态会计入实验完成度。" />
      <div className="gl-checklist-summary">
        <div className="gl-progress-ring" style={{ '--progress': `${completion * 3.6}deg` } as CSSProperties}><span>{completion}%</span></div>
        <div><strong>{checked} / {value.length} 项已确认</strong><p>{completion === 100 ? '上线门槛已全部确认。' : '继续完成上线前的质量门禁。'}</p></div>
      </div>
      <div className="gl-checklist">
        {value.map((item, index) => (
          <label className={item.checked ? 'is-checked' : ''} key={item.id}>
            <input
              className="sr-only"
              type="checkbox"
              checked={item.checked}
              onChange={(event) => onChange(value.map((candidate) => candidate.id === item.id ? { ...candidate, checked: event.target.checked } : candidate))}
            />
            {item.checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            <span><small>{String(index + 1).padStart(2, '0')}</small>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
