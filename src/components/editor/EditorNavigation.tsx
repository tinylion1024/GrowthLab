import { AlertCircle, Check } from 'lucide-react'
import type { EditorModule, EditorModuleId } from '../types'

export interface EditorNavigationProps {
  modules: EditorModule[]
  activeModule: EditorModuleId
  completion: number
  onSelect: (id: EditorModuleId) => void
}

export function EditorNavigation({ modules, activeModule, completion, onSelect }: EditorNavigationProps) {
  return (
    <>
      <aside className="gl-editor-rail">
        <div className="gl-editor-progress">
          <div className="gl-editor-progress__label"><span>方案完成度</span><strong>{completion}%</strong></div>
          <div className="gl-progress-track" aria-label={`方案完成度 ${completion}%`}><span style={{ width: `${completion}%` }} /></div>
          <p>{modules.filter((module) => module.complete).length} / {modules.length} 个模块完成</p>
        </div>
        <nav aria-label="实验模块">
          <ol>
            {modules.map((module, index) => (
              <li key={module.id}>
                <button type="button" className={activeModule === module.id ? 'is-active' : ''} aria-current={activeModule === module.id ? 'step' : undefined} onClick={() => onSelect(module.id)}>
                  <span className="gl-editor-rail__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="gl-editor-rail__label">{module.label}</span>
                  {module.issueCount ? <span className="gl-editor-rail__issue" aria-label={`${module.issueCount} 个问题`}><AlertCircle size={15} /> {module.issueCount}</span> : module.complete ? <Check className="gl-editor-rail__check" size={15} /> : null}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <div className="gl-editor-mobile-nav">
        <label htmlFor="editor-module-select">当前模块</label>
        <select id="editor-module-select" value={activeModule} onChange={(event) => onSelect(event.target.value as EditorModuleId)}>
          {modules.map((module, index) => <option key={module.id} value={module.id}>{String(index + 1).padStart(2, '0')} · {module.shortLabel}{module.complete ? ' ✓' : ''}</option>)}
        </select>
        <span>{completion}%</span>
      </div>
    </>
  )
}
