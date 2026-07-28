import { Plus, X } from 'lucide-react'
import { Button } from './Button'

export interface EditableListProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyLabel?: string
}

export function EditableList({
  label,
  values,
  onChange,
  placeholder = '输入内容',
  emptyLabel = '暂未添加',
}: EditableListProps) {
  const update = (index: number, value: string) => {
    const next = [...values]
    next[index] = value
    onChange(next)
  }

  return (
    <fieldset className="gl-list-field">
      <legend>{label}</legend>
      {values.length === 0 && <p className="gl-list-field__empty">{emptyLabel}</p>}
      {values.map((value, index) => (
        <div className="gl-list-field__row" key={`${index}-${value.slice(0, 12)}`}>
          <span className="gl-list-field__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <input
            className="gl-input"
            value={value}
            onChange={(event) => update(index, event.target.value)}
            placeholder={placeholder}
            aria-label={`${label} ${index + 1}`}
          />
          <button
            className="gl-icon-button"
            type="button"
            aria-label={`删除${label} ${index + 1}`}
            onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        icon={<Plus size={15} />}
        onClick={() => onChange([...values, ''])}
      >
        添加一项
      </Button>
    </fieldset>
  )
}
