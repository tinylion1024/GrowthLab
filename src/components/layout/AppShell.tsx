import { Beaker, Plus, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/Button'

export interface AppShellProps {
  children: ReactNode
  activeView: 'home' | 'editor'
  onHome: () => void
  onNewExperiment: () => void
  onOpenSettings: () => void
}

export function AppShell({
  children,
  activeView,
  onHome,
  onNewExperiment,
  onOpenSettings,
}: AppShellProps) {
  return (
    <div className="gl-app">
      <a className="gl-skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="gl-topbar">
        <button className="gl-brand" type="button" onClick={onHome} aria-label="返回 GrowthLab 首页">
          <span className="gl-brand__mark" aria-hidden="true">
            <Beaker size={20} strokeWidth={2.2} />
          </span>
          <span className="gl-brand__word">GrowthLab</span>
          <span className="gl-brand__descriptor">实验工作台</span>
        </button>
        <nav className="gl-topbar__nav" aria-label="主要导航">
          <button
            type="button"
            className={activeView === 'home' ? 'is-active' : ''}
            aria-current={activeView === 'home' ? 'page' : undefined}
            onClick={onHome}
          >
            项目
          </button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Settings size={16} />}
            onClick={onOpenSettings}
          >
            模型设置
          </Button>
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={onNewExperiment}
          >
            新建实验
          </Button>
        </nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className="gl-footer">
        <span>GrowthLab / 结构化增长实验</span>
        <span>本地优先 · 密钥仅用于浏览器直接请求</span>
      </footer>
    </div>
  )
}
