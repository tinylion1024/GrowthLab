import { ArrowUpRight, FileInput, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ExperimentComposer } from '../components/home/ExperimentComposer'
import { ProjectCard } from '../components/home/ProjectCard'
import type { ExperimentSummary, GrowthContextInput } from '../components/types'
import { Button } from '../components/ui/Button'
import { StatePanel } from '../components/feedback/StatePanel'

export interface HomePageProps {
  projects: ExperimentSummary[]
  generating?: boolean
  onGenerate: (problem: string, context: GrowthContextInput) => void
  onUseDemo: () => void
  onOpenProject: (id: string) => void
  onRenameProject: (id: string) => void
  onDuplicateProject: (id: string) => void
  onDeleteProject: (id: string) => void
  onImportJson: () => void
}

export function HomePage({
  projects,
  generating,
  onGenerate,
  onUseDemo,
  onOpenProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onImportJson,
}: HomePageProps) {
  const [query, setQuery] = useState('')
  const filteredProjects = useMemo(
    () => projects.filter((project) =>
      `${project.name} ${project.summary} ${project.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [projects, query],
  )

  return (
    <div className="gl-home">
      <section className="gl-home-hero">
        <div className="gl-home-hero__copy">
          <p className="gl-eyebrow">AI GROWTH EXPERIMENT WORKBENCH</p>
          <h1>把模糊的增长问题，<br /><em>变成可以直接上线的实验方案。</em></h1>
          <p className="gl-home-hero__lead">
            从核心假设、分组与指标，到样本量、风险和决策规则，一次整理为可编辑的结构化工作稿。
          </p>
        </div>
        <div className="gl-before-after" aria-label="输入和产出示例">
          <div>
            <span>BEFORE / 模糊问题</span>
            <p>“优化一下任务页转化率。”</p>
          </div>
          <ArrowUpRight size={22} aria-hidden="true" />
          <div>
            <span>AFTER / 实验工作稿</span>
            <p>目标人群、核心假设、实验分组、指标体系、样本量、决策规则和复盘模板。</p>
          </div>
        </div>
      </section>

      <ExperimentComposer generating={generating} onGenerate={onGenerate} onUseDemo={onUseDemo} />

      <section className="gl-projects" aria-labelledby="projects-title">
        <div className="gl-projects__header">
          <div>
            <p className="gl-eyebrow">LOCAL EXPERIMENTS / {String(projects.length).padStart(2, '0')}</p>
            <h2 id="projects-title">最近的实验</h2>
          </div>
          <div className="gl-projects__tools">
            <label className="gl-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">搜索项目</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目或标签" />
            </label>
            <Button variant="secondary" size="sm" icon={<FileInput size={16} />} onClick={onImportJson}>
              导入 JSON
            </Button>
          </div>
        </div>
        {filteredProjects.length > 0 ? (
          <div className="gl-project-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                experiment={project}
                onOpen={onOpenProject}
                onRename={onRenameProject}
                onDuplicate={onDuplicateProject}
                onDelete={onDeleteProject}
              />
            ))}
          </div>
        ) : (
          <StatePanel
            title={projects.length === 0 ? '这里还没有实验工作稿' : '没有找到匹配的项目'}
            description={projects.length === 0 ? '用上方示例生成一份完整方案，或输入自己的增长问题。' : '试试更短的关键词，或清空搜索条件。'}
            actionLabel={projects.length === 0 ? '使用示例体验' : '清空搜索'}
            onAction={projects.length === 0 ? onUseDemo : () => setQuery('')}
          />
        )}
      </section>
    </div>
  )
}
