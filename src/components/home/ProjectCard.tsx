import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ExperimentSummary } from '../types'
import { StatusBadge } from '../ui/StatusBadge'

export interface ProjectCardProps {
  experiment: ExperimentSummary
  onOpen: (id: string) => void
  onRename: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectCard({
  experiment,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <article className="gl-project-card">
      <div className="gl-project-card__top">
        <StatusBadge tone={experiment.status === 'ready' ? 'success' : 'neutral'} dot>
          {experiment.status === 'ready' ? '已完成' : '草稿'}
        </StatusBadge>
        <div className="gl-menu">
          <button
            className="gl-icon-button"
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`${experiment.name} 项目操作`}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="gl-menu__popover" role="menu">
              <button role="menuitem" onClick={() => { onRename(experiment.id); setMenuOpen(false) }}><Pencil size={15} /> 重命名</button>
              <button role="menuitem" onClick={() => { onDuplicate(experiment.id); setMenuOpen(false) }}><Copy size={15} /> 创建副本</button>
              <button className="is-danger" role="menuitem" onClick={() => { onDelete(experiment.id); setMenuOpen(false) }}><Trash2 size={15} /> 删除项目</button>
            </div>
          )}
        </div>
      </div>
      <button className="gl-project-card__body" type="button" onClick={() => onOpen(experiment.id)}>
        <span className="gl-project-card__folio" aria-hidden="true">
          EXP / {experiment.id.slice(-4).toUpperCase()}
        </span>
        <h3>{experiment.name}</h3>
        <p>{experiment.summary}</p>
        <div className="gl-project-card__tags">
          {experiment.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </button>
      <div className="gl-project-card__footer">
        <span>{experiment.updatedAt}</span>
        <div className="gl-progress-small" aria-label={`完成度 ${experiment.completion}%`}>
          <span style={{ width: `${experiment.completion}%` }} />
        </div>
        <strong>{experiment.completion}%</strong>
      </div>
    </article>
  )
}
