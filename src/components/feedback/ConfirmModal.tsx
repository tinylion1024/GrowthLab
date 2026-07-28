import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '../ui/Button'

export interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="gl-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        className="gl-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="gl-modal__header">
          <span className={`gl-modal__mark ${destructive ? 'gl-modal__mark--danger' : ''}`}>
            <AlertTriangle size={20} />
          </span>
          <button className="gl-icon-button" onClick={onCancel} aria-label="关闭" type="button">
            <X size={18} />
          </button>
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div className="gl-modal__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
