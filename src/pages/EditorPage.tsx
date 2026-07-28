import { ArrowLeft, CheckCircle2, ChevronDown, Clipboard, Download, FileJson, Save, Settings, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AudienceForm } from '../components/editor/AudienceForm'
import { CopyPlansForm } from '../components/editor/CopyPlansForm'
import { DecisionRulesForm } from '../components/editor/DecisionRulesForm'
import { EditorNavigation } from '../components/editor/EditorNavigation'
import { ExperimentDesignForm } from '../components/editor/ExperimentDesignForm'
import { HypothesesForm } from '../components/editor/HypothesesForm'
import { LaunchChecklist } from '../components/editor/LaunchChecklist'
import { MetricsForm } from '../components/editor/MetricsForm'
import { OverviewForm } from '../components/editor/OverviewForm'
import { ProblemAnalysisForm } from '../components/editor/ProblemAnalysisForm'
import { RetrospectiveForm } from '../components/editor/RetrospectiveForm'
import { RisksForm } from '../components/editor/RisksForm'
import { SamplePlanForm } from '../components/editor/SamplePlanForm'
import type { AiState, EditorModule, EditorModuleId, EditorValues, SaveState } from '../components/types'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'

export interface EditorPageProps {
  experimentId: string
  values: EditorValues
  status: 'draft' | 'ready'
  lastSavedAt: string
  saveState?: SaveState
  aiState?: AiState
  completion: number
  moduleCompletion?: Partial<Record<EditorModuleId, boolean>>
  moduleIssues?: Partial<Record<EditorModuleId, number>>
  optimizingHypothesisId?: string
  onChange: (values: EditorValues) => void
  onSave: () => void
  onBack: () => void
  onOpenSettings: () => void
  onExportMarkdown: () => void
  onCopyMarkdown: () => void
  onExportJson: () => void
  onOptimizeHypothesis: (id: string) => void
  onRecalculateSample: (sample: EditorValues['sample']) => void
}

const moduleDefinitions: Array<Omit<EditorModule, 'complete' | 'issueCount'>> = [
  { id: 'overview', label: '实验概览', shortLabel: '概览' },
  { id: 'problem', label: '问题拆解', shortLabel: '问题' },
  { id: 'hypotheses', label: '核心假设', shortLabel: '假设' },
  { id: 'design', label: '实验设计', shortLabel: '设计' },
  { id: 'audience', label: '目标人群', shortLabel: '人群' },
  { id: 'metrics', label: '指标体系', shortLabel: '指标' },
  { id: 'sample', label: '样本量与周期', shortLabel: '样本' },
  { id: 'copy', label: '页面文案', shortLabel: '文案' },
  { id: 'risks', label: '风险清单', shortLabel: '风险' },
  { id: 'decision', label: '决策规则', shortLabel: '决策' },
  { id: 'retrospective', label: '复盘模板', shortLabel: '复盘' },
  { id: 'checklist', label: '上线检查', shortLabel: '上线' },
]

export function EditorPage({
  experimentId,
  values,
  status,
  lastSavedAt,
  saveState = 'saved',
  aiState = 'complete',
  completion,
  moduleCompletion = {},
  moduleIssues = {},
  optimizingHypothesisId,
  onChange,
  onSave,
  onBack,
  onOpenSettings,
  onExportMarkdown,
  onCopyMarkdown,
  onExportJson,
  onOptimizeHypothesis,
  onRecalculateSample,
}: EditorPageProps) {
  const [activeModule, setActiveModule] = useState<EditorModuleId>('overview')
  const [exportOpen, setExportOpen] = useState(false)
  const modules = useMemo<EditorModule[]>(
    () => moduleDefinitions.map((module) => ({ ...module, complete: Boolean(moduleCompletion[module.id]), issueCount: moduleIssues[module.id] })),
    [moduleCompletion, moduleIssues],
  )

  const addHypothesis = () => onChange({
    ...values,
    hypotheses: [...values.hypotheses, {
      id: crypto.randomUUID(), name: '', if: '', then: '', because: '', insight: '', evidence: '',
      confidence: 'medium', impact: 'medium', cost: 'medium', priority: values.hypotheses.length + 1,
      validation: '', isPrimary: values.hypotheses.length === 0,
    }],
  })
  const addVariant = () => onChange({
    ...values,
    design: { ...values.design, variants: [...values.design.variants, {
      id: crypto.randomUUID(), name: `实验组 ${values.design.variants.length}`, type: 'treatment',
      description: '', uniqueDifference: '', trafficPercentage: 0, developmentRequirements: '', trackingRequirements: '',
    }] },
  })
  const addMetric = () => onChange({
    ...values,
    metrics: [...values.metrics, {
      id: crypto.randomUUID(), name: '', category: 'secondary', valueType: 'conversion_rate', definition: '', formula: '', numerator: '',
      denominator: '', window: '', source: '', direction: 'increase', mde: '', isTracked: false, notes: '',
    }],
  })
  const addCopy = () => onChange({
    ...values,
    copy: [...values.copy, {
      id: crypto.randomUUID(), direction: '新文案方向', strategy: 'custom', title: '', subtitle: '', benefit: '', cta: '',
      supportingText: '', riskNotice: '', emptyState: '', successMessage: '', errorMessage: '', scenario: '',
      hypothesis: '', expectedImpact: '', potentialRisk: '',
    }],
  })
  const addRisk = () => onChange({
    ...values,
    risks: [...values.risks, {
      id: crypto.randomUUID(), description: '', category: '', probability: 'medium', impact: 'medium',
      level: 'medium', warningMetric: '', mitigation: '', contingency: '', owner: '',
    }],
  })

  const moduleContent: Record<EditorModuleId, ReactNode> = {
    overview: <OverviewForm value={values.overview} onChange={(overview) => onChange({ ...values, overview })} />,
    problem: <ProblemAnalysisForm value={values.problem} onChange={(problem) => onChange({ ...values, problem })} />,
    hypotheses: <HypothesesForm value={values.hypotheses} optimizingId={optimizingHypothesisId} onChange={(hypotheses) => onChange({ ...values, hypotheses })} onOptimize={onOptimizeHypothesis} onAdd={addHypothesis} />,
    design: <ExperimentDesignForm value={values.design} onChange={(design) => onChange({ ...values, design })} onAddVariant={addVariant} />,
    audience: <AudienceForm value={values.audience} onChange={(audience) => onChange({ ...values, audience })} />,
    metrics: <MetricsForm value={values.metrics} onChange={(metrics) => onChange({ ...values, metrics })} onAdd={addMetric} />,
    sample: <SamplePlanForm value={values.sample} onChange={(sample) => onChange({ ...values, sample })} onRecalculate={onRecalculateSample} />,
    copy: <CopyPlansForm value={values.copy} onChange={(copy) => onChange({ ...values, copy })} onAdd={addCopy} />,
    risks: <RisksForm value={values.risks} onChange={(risks) => onChange({ ...values, risks })} onAdd={addRisk} />,
    decision: <DecisionRulesForm value={values.decision} onChange={(decision) => onChange({ ...values, decision })} />,
    retrospective: <RetrospectiveForm value={values.retrospective} onChange={(retrospective) => onChange({ ...values, retrospective })} />,
    checklist: <LaunchChecklist value={values.checklist} onChange={(checklist) => onChange({ ...values, checklist })} />,
  }

  return (
    <div className="gl-editor">
      <header className="gl-editor-header">
        <button type="button" className="gl-editor-back" onClick={onBack}><ArrowLeft size={17} /> 返回项目</button>
        <div className="gl-editor-title">
          <div>
            <span className="gl-editor-title__id">EXP / {experimentId.slice(-6).toUpperCase()}</span>
            <h1>{values.overview.name}</h1>
          </div>
          <div className="gl-editor-meta">
            <StatusBadge tone={status === 'ready' ? 'success' : 'neutral'} dot>{status === 'ready' ? '已完成' : '草稿'}</StatusBadge>
            <span>{saveState === 'saving' ? '保存中…' : saveState === 'dirty' ? '有未保存更改' : saveState === 'error' ? '保存失败' : `最后保存 ${lastSavedAt}`}</span>
            {aiState === 'generating' ? <StatusBadge tone="info"><Sparkles size={13} /> AI 生成中</StatusBadge> : aiState === 'complete' ? <span className="gl-ai-complete"><CheckCircle2 size={15} /> AI 首稿已完成</span> : null}
          </div>
        </div>
        <div className="gl-editor-actions">
          <Button variant="ghost" size="sm" icon={<Settings size={16} />} onClick={onOpenSettings}>模型设置</Button>
          <Button variant="secondary" size="sm" icon={<Save size={16} />} loading={saveState === 'saving'} onClick={onSave}>保存</Button>
          <div className="gl-export-menu">
            <Button size="sm" icon={<Download size={16} />} onClick={() => setExportOpen((current) => !current)}>导出 <ChevronDown size={14} /></Button>
            {exportOpen && (
              <div className="gl-menu__popover gl-export-menu__popover">
                <button type="button" onClick={() => { onExportMarkdown(); setExportOpen(false) }}><Download size={15} /> 下载 Markdown</button>
                <button type="button" onClick={() => { onCopyMarkdown(); setExportOpen(false) }}><Clipboard size={15} /> 复制 Markdown</button>
                <button type="button" onClick={() => { onExportJson(); setExportOpen(false) }}><FileJson size={15} /> 下载 JSON</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="gl-editor-body">
        <EditorNavigation modules={modules} activeModule={activeModule} completion={completion} onSelect={setActiveModule} />
        <main className="gl-editor-content" id="editor-module-content">
          {moduleContent[activeModule]}
          <div className="gl-editor-content__footer">
            <span>模块 {String(modules.findIndex((module) => module.id === activeModule) + 1).padStart(2, '0')} / {modules.length}</span>
            {modules.findIndex((module) => module.id === activeModule) < modules.length - 1 && (
              <Button variant="secondary" onClick={() => {
                const currentIndex = modules.findIndex((module) => module.id === activeModule)
                const next = modules[currentIndex + 1]
                if (next) { setActiveModule(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
              }}>下一模块</Button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
