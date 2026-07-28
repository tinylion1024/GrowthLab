import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { BadgeTone } from '../ui/StatusBadge'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  tone?: BadgeTone
}

export interface ToastRegionProps {
  messages: ToastMessage[]
  onDismiss: (id: string) => void
}

const toneIcons = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
}

export function ToastRegion({ messages, onDismiss }: ToastRegionProps) {
  return (
    <div className="gl-toast-region" role="region" aria-label="通知">
      {messages.map((message) => {
        const tone = message.tone ?? 'neutral'
        const Icon = toneIcons[tone]
        return (
          <div className={`gl-toast gl-toast--${tone}`} role="status" key={message.id}>
            <Icon size={19} aria-hidden="true" />
            <div className="gl-toast__content">
              <strong>{message.title}</strong>
              {message.description && <p>{message.description}</p>}
            </div>
            <button
              className="gl-icon-button gl-toast__close"
              onClick={() => onDismiss(message.id)}
              aria-label="关闭通知"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
