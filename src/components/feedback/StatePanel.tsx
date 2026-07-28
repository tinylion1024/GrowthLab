import { AlertCircle, Beaker, FileQuestion, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/Button'

interface StatePanelProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
  tone?: 'neutral' | 'error'
}

export function StatePanel({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = 'neutral',
}: StatePanelProps) {
  return (
    <div className={`gl-state-panel gl-state-panel--${tone}`}>
      <div className="gl-state-panel__icon">
        {icon ?? (tone === 'error' ? <AlertCircle size={23} /> : <FileQuestion size={23} />)}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <Button
          variant={tone === 'error' ? 'secondary' : 'primary'}
          icon={tone === 'error' ? <RefreshCw size={16} /> : <Beaker size={16} />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="gl-skeleton-card" aria-label="正在加载" aria-busy="true">
      <span className="gl-skeleton gl-skeleton--tag" />
      <span className="gl-skeleton gl-skeleton--title" />
      <span className="gl-skeleton gl-skeleton--line" />
      <span className="gl-skeleton gl-skeleton--line-short" />
      <div className="gl-skeleton-card__footer">
        <span className="gl-skeleton gl-skeleton--button" />
        <span className="gl-skeleton gl-skeleton--button" />
      </div>
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="gl-editor-skeleton" aria-label="正在生成实验方案" aria-busy="true">
      <div className="gl-editor-skeleton__rail">
        {Array.from({ length: 8 }).map((_, index) => (
          <span className="gl-skeleton gl-skeleton--nav" key={index} />
        ))}
      </div>
      <div className="gl-editor-skeleton__content">
        <span className="gl-skeleton gl-skeleton--tag" />
        <span className="gl-skeleton gl-skeleton--hero-title" />
        <span className="gl-skeleton gl-skeleton--line" />
        <div className="gl-editor-skeleton__grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <span className="gl-skeleton gl-skeleton--field" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
