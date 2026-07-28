import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <header className="gl-section-header">
      <div>
        <p className="gl-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="gl-section-header__action">{action}</div>}
    </header>
  )
}
