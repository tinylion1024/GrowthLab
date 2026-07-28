import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function StatusBadge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
}) {
  return (
    <span className={`gl-badge gl-badge--${tone}`}>
      {dot && <span className="gl-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
