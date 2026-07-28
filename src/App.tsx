import { AlertTriangle, Braces, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { ConfirmModal } from './components/feedback/ConfirmModal'
import { EditorSkeleton } from './components/feedback/StatePanel'
import { ToastRegion, type ToastMessage } from './components/feedback/ToastRegion'
import { AppShell } from './components/layout/AppShell'
import { ModelSettingsDrawer } from './components/settings/ModelSettingsDrawer'
import type { GrowthContextInput, ModelSettingsValue } from './components/types'
import { Button } from './components/ui/Button'
import { DEMO_EXPERIMENT, createEmptyExperiment } from './data'
import {
  editorValuesToExperiment,
  experimentToEditorValues,
  experimentToSummary,
  getCompletionPercentage,
  getModuleCompletion,
  getModuleIssues,
  useExperimentStore,
} from './features/experiments'
import {
  clearModelSettings,
  loadModelSettings,
  saveModelSettings,
  type ModelSettings,
} from './features/settings'
import {
  generateExperimentModule,
  generateFullExperiment,
  isAiAdapterError,
  testConnection,
  type GenerationInput,
  type ModelConnectionConfig,
} from './lib/ai'
import {
  createJsonFilename,
  createMarkdownFilename,
  experimentToJson,
  experimentToMarkdown,
} from './lib/markdown'
import {
  calculateProportionSampleSize,
  estimateExperimentDuration,
} from './lib/statistics'
import {
  deleteExperiment,
  duplicateExperiment,
  importExperimentJson,
  loadExperiments,
  saveExperiments,
} from './lib/storage'
import { EditorPage } from './pages/EditorPage'
import { HomePage } from './pages/HomePage'
import { hypothesisSchema } from './schemas'
import type { GrowthExperiment } from './types'
import './styles/growthlab.css'

interface AiFailure {
  title: string
  message: string
  suggestion: string
  rawResponse?: string
}

function createId(prefix = 'experiment'): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function modelSettingsToView(settings: ModelSettings): ModelSettingsValue {
  return {
    baseUrl: settings.apiBaseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    requestPath: settings.chatCompletionsPath,
    jsonMode: settings.jsonMode,
    rememberNonSensitive: settings.rememberNonSensitive,
  }
}

function viewToModelSettings(settings: ModelSettingsValue): ModelSettings {
  return {
    apiBaseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    chatCompletionsPath: settings.requestPath,
    jsonMode: settings.jsonMode,
    rememberNonSensitive: settings.rememberNonSensitive,
  }
}

function toConnectionConfig(settings: ModelSettingsValue): ModelConnectionConfig {
  return {
    apiBaseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    chatCompletionsPath: settings.requestPath,
    jsonMode: settings.jsonMode,
  }
}

function toAiFailure(error: unknown): AiFailure {
  if (isAiAdapterError(error)) {
    return {
      title: error.code === 'cancelled' ? '生成已取消' : 'AI 生成未完成',
      message: error.message,
      suggestion: error.suggestion,
      rawResponse: error.rawResponse,
    }
  }
  return {
    title: '操作未完成',
    message: error instanceof Error ? error.message : '发生未知错误。',
    suggestion: '请检查输入与浏览器环境后重试。',
  }
}

function formatSavedAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '刚刚'
    : new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
}

function downloadText(filename: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function generationContext(context: GrowthContextInput): string {
  const entries = Object.entries(context).filter(([, value]) => value.trim())
  return entries.length
    ? entries.map(([key, value]) => `${key}: ${value}`).join('\n')
    : '用户未补充额外背景；缺失信息必须标记为“待确认”。'
}

export default function App() {
  const {
    experiments,
    activeId,
    view,
    saveState,
    hydrate,
    setExperiments,
    openExperiment,
    goHome,
    updateExperiment,
    setSaveState,
  } = useExperimentStore()
  const [settings, setSettings] = useState<ModelSettingsValue>(() => modelSettingsToView(loadModelSettings()))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [connectionState, setConnectionState] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [optimizingHypothesisId, setOptimizingHypothesisId] = useState<string>()
  const [aiFailure, setAiFailure] = useState<AiFailure | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const hydratedRef = useRef(false)
  const retryRef = useRef<(() => void) | null>(null)

  const activeExperiment = useMemo(
    () => experiments.find((experiment) => experiment.id === activeId) ?? null,
    [activeId, experiments],
  )

  const pushToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = createId('toast')
    setToasts((current) => [...current, { ...message, id }].slice(-4))
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, 5_000)
  }, [])

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const result = loadExperiments(window.localStorage)
    hydrate(result.experiments)
    if (result.error) {
      pushToast({
        title: result.recovered ? '本地项目已安全恢复' : '读取本地项目失败',
        description: result.error,
        tone: 'warning',
      })
    }
  }, [hydrate, pushToast])

  useEffect(() => {
    if (!hydratedRef.current || saveState !== 'dirty') return
    const timeout = window.setTimeout(() => {
      setSaveState('saving')
      try {
        saveExperiments(window.localStorage, experiments)
        setSaveState('saved')
      } catch (error) {
        setSaveState('error')
        pushToast({
          title: '自动保存失败',
          description: error instanceof Error ? error.message : '请导出 JSON 备份后重试。',
          tone: 'danger',
        })
      }
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [experiments, pushToast, saveState, setSaveState])

  useEffect(() => {
    if (view === 'editor' && !activeExperiment) goHome()
  }, [activeExperiment, goHome, view])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeId, view])

  const saveNow = useCallback(() => {
    setSaveState('saving')
    try {
      saveExperiments(window.localStorage, experiments)
      setSaveState('saved')
      pushToast({ title: '实验已保存到本地', tone: 'success' })
    } catch (error) {
      setSaveState('error')
      pushToast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '请检查数据后重试。',
        tone: 'danger',
      })
    }
  }, [experiments, pushToast, setSaveState])

  const addAndOpen = useCallback((experiment: GrowthExperiment) => {
    updateExperiment(experiment)
    openExperiment(experiment.id)
  }, [openExperiment, updateExperiment])

  const createNewExperiment = useCallback(() => {
    addAndOpen(createEmptyExperiment(createId()))
  }, [addAndOpen])

  const useDemo = useCallback(() => {
    const now = new Date().toISOString()
    addAndOpen({
      ...structuredClone(DEMO_EXPERIMENT),
      id: createId('demo'),
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      overview: {
        ...DEMO_EXPERIMENT.overview,
        name: experiments.some((item) => item.overview.name === DEMO_EXPERIMENT.overview.name)
          ? `${DEMO_EXPERIMENT.overview.name}（示例）`
          : DEMO_EXPERIMENT.overview.name,
      },
    })
    pushToast({ title: '完整示例已载入', description: '所有模块都可以继续编辑。', tone: 'success' })
  }, [addAndOpen, experiments, pushToast])

  const requireModelConfig = useCallback((): boolean => {
    if (settings.apiKey.trim() && settings.model.trim() && settings.baseUrl.trim()) return true
    setSettingsOpen(true)
    pushToast({
      title: '先配置模型再生成',
      description: '填写 Base URL、API Key 和模型名称；也可以直接使用内置示例。',
      tone: 'warning',
    })
    return false
  }, [pushToast, settings])

  const runGeneration = useCallback(async (input: GenerationInput) => {
    if (!requireModelConfig()) return
    setGenerating(true)
    setAiFailure(null)
    const controller = new AbortController()
    abortControllerRef.current = controller
    retryRef.current = () => { void runGeneration(input) }
    try {
      const result = await generateFullExperiment(toConnectionConfig(settings), input, {
        signal: controller.signal,
      })
      addAndOpen(result.data)
      pushToast({ title: '实验首稿已生成', description: '请逐项复核待确认信息和上线检查项。', tone: 'success' })
    } catch (error) {
      const failure = toAiFailure(error)
      if (isAiAdapterError(error) && error.code === 'cancelled') {
        pushToast({ title: '生成已取消', tone: 'neutral' })
      } else {
        setAiFailure(failure)
      }
    } finally {
      abortControllerRef.current = null
      setGenerating(false)
    }
  }, [addAndOpen, pushToast, requireModelConfig, settings])

  const generate = useCallback((problem: string, context: GrowthContextInput) => {
    void runGeneration({ problem, context: generationContext(context) })
  }, [runGeneration])

  const updateEditorValues = useCallback((values: ReturnType<typeof experimentToEditorValues>) => {
    if (!activeExperiment) return
    updateExperiment(editorValuesToExperiment(activeExperiment, values))
  }, [activeExperiment, updateExperiment])

  const recalculateSample = useCallback((sample: ReturnType<typeof experimentToEditorValues>['sample']) => {
    if (!activeExperiment) return
    const values = experimentToEditorValues(activeExperiment)
    values.sample = sample
    try {
      if (sample.metricKind !== 'proportion') throw new Error('仅比例类指标支持当前计算器')
      const baseline = Number(sample.baselineRate) / 100
      const target = sample.targetRate.trim() ? Number(sample.targetRate) / 100 : null
      const relativeMde = sample.relativeMde.trim() ? Number(sample.relativeMde) / 100 : null
      const ratios = sample.splitRatios.split(',').map((item) => Number(item.trim())).filter(Number.isFinite)
      const result = calculateProportionSampleSize({
        baselineRate: baseline,
        targetRate: target,
        relativeMde,
        alpha: Number(sample.alpha),
        power: Number(sample.power),
        testTail: sample.sidedness,
        treatmentGroupCount: sample.groupCount,
        allocationRatios: ratios.length ? ratios : undefined,
      })
      const duration = estimateExperimentDuration({
        totalSampleSize: result.totalSampleSize,
        dailyEligibleTraffic: sample.dailyTraffic.trim() ? Number(sample.dailyTraffic) : null,
        experimentTrafficRatio: Number(sample.trafficPercentage) / 100,
      })
      values.sample = {
        ...sample,
        targetRate: sample.targetRate || String(Number((result.targetRate * 100).toFixed(4))),
        samplePerGroup: result.sampleSizePerGroup,
        totalSample: result.totalSampleSize,
        estimatedDays: duration.estimatedDays ?? undefined,
        recommendation: duration.recommendedDuration,
        assumptions: result.assumptions,
        warnings: [...result.warnings, ...duration.warnings],
      }
    } catch {
      values.sample = {
        ...sample,
        samplePerGroup: undefined,
        totalSample: undefined,
        estimatedDays: undefined,
        recommendation: sample.metricKind === 'proportion' ? '待补充有效参数后计算' : '请补充历史均值与方差后进行统计评审',
      }
    }
    updateExperiment(editorValuesToExperiment(activeExperiment, values))
  }, [activeExperiment, updateExperiment])

  const optimizeHypothesis = useCallback(async (id: string) => {
    if (!activeExperiment || !requireModelConfig()) return
    const selected = activeExperiment.hypotheses.find((item) => item.id === id)
    if (!selected) return
    setOptimizingHypothesisId(id)
    setAiFailure(null)
    const controller = new AbortController()
    abortControllerRef.current = controller
    const retry = () => { void optimizeHypothesis(id) }
    retryRef.current = retry
    try {
      const result = await generateExperimentModule(
        toConnectionConfig(settings),
        'hypotheses',
        activeExperiment,
        z.array(hypothesisSchema),
        `只改写 ID 为 ${id} 的假设，保留其他假设和该 ID；强化“如果—那么—因为”、证据边界和验证方式。`,
        { signal: controller.signal },
      )
      const replacement = result.data.find((item) => item.id === id) ?? result.data[0]
      if (!replacement) throw new Error('模型没有返回可用假设')
      updateExperiment({
        ...activeExperiment,
        updatedAt: new Date().toISOString(),
        hypotheses: activeExperiment.hypotheses.map((item) =>
          item.id === id ? { ...replacement, id, isPrimary: item.isPrimary } : item),
      })
      pushToast({ title: '假设已改写', description: '其他模块和其他假设保持不变。', tone: 'success' })
    } catch (error) {
      if (!(isAiAdapterError(error) && error.code === 'cancelled')) setAiFailure(toAiFailure(error))
    } finally {
      abortControllerRef.current = null
      setOptimizingHypothesisId(undefined)
    }
  }, [activeExperiment, pushToast, requireModelConfig, settings, updateExperiment])

  const testModelConnection = useCallback(async () => {
    setConnectionState('testing')
    setConnectionMessage('正在验证接口与模型…')
    try {
      const result = await testConnection(toConnectionConfig(settings))
      setConnectionState('success')
      setConnectionMessage(`连接成功：${result.model}`)
    } catch (error) {
      const failure = toAiFailure(error)
      setConnectionState('error')
      setConnectionMessage(`${failure.message} ${failure.suggestion}`)
    }
  }, [settings])

  const persistSettings = useCallback(() => {
    saveModelSettings(viewToModelSettings(settings))
    setSettingsOpen(false)
    setConnectionState('idle')
    setConnectionMessage('')
    pushToast({
      title: '模型设置已保存',
      description: settings.rememberNonSensitive ? 'API Key 仍只保存在当前会话。' : '配置仅在当前浏览器会话中使用。',
      tone: 'success',
    })
  }, [pushToast, settings])

  const clearSettings = useCallback(() => {
    const cleared = clearModelSettings()
    setSettings(modelSettingsToView(cleared))
    setConnectionState('idle')
    setConnectionMessage('配置已清除。')
  }, [])

  const renameProject = useCallback((id: string) => {
    const experiment = experiments.find((item) => item.id === id)
    if (!experiment) return
    const name = window.prompt('输入新的实验名称', experiment.overview.name)?.trim()
    if (!name || name === experiment.overview.name) return
    updateExperiment({
      ...experiment,
      updatedAt: new Date().toISOString(),
      overview: { ...experiment.overview, name },
    })
  }, [experiments, updateExperiment])

  const duplicateProject = useCallback((id: string) => {
    const experiment = experiments.find((item) => item.id === id)
    if (!experiment) return
    const duplicate = duplicateExperiment(experiment, createId())
    updateExperiment(duplicate)
    pushToast({ title: '已创建实验副本', tone: 'success' })
  }, [experiments, pushToast, updateExperiment])

  const confirmDelete = useCallback(() => {
    if (!deleteTargetId) return
    try {
      const next = deleteExperiment(window.localStorage, deleteTargetId)
      setExperiments(next)
      if (activeId === deleteTargetId) goHome()
      pushToast({ title: '实验已删除', description: '本地项目列表已更新。', tone: 'success' })
    } catch (error) {
      pushToast({ title: '删除失败', description: error instanceof Error ? error.message : '请重试。', tone: 'danger' })
    } finally {
      setDeleteTargetId(null)
    }
  }, [activeId, deleteTargetId, goHome, pushToast, setExperiments])

  const importJsonFile = useCallback(async (file: File) => {
    try {
      const imported = importExperimentJson(await file.text())
      const idExists = experiments.some((item) => item.id === imported.id)
      const now = new Date().toISOString()
      addAndOpen(idExists ? { ...imported, id: createId(), createdAt: now, updatedAt: now } : imported)
      pushToast({ title: '实验已导入', description: '导入内容已通过结构校验。', tone: 'success' })
    } catch (error) {
      pushToast({ title: '导入失败', description: error instanceof Error ? error.message : '文件无法读取。', tone: 'danger' })
    }
  }, [addAndOpen, experiments, pushToast])

  const exportMarkdown = useCallback(() => {
    if (!activeExperiment) return
    downloadText(createMarkdownFilename(activeExperiment), experimentToMarkdown(activeExperiment), 'text/markdown;charset=utf-8')
    pushToast({ title: 'Markdown 已导出', tone: 'success' })
  }, [activeExperiment, pushToast])

  const copyMarkdown = useCallback(async () => {
    if (!activeExperiment) return
    const markdown = experimentToMarkdown(activeExperiment)
    try {
      await navigator.clipboard.writeText(markdown)
      pushToast({ title: 'Markdown 已复制', tone: 'success' })
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = markdown
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.append(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      textarea.remove()
      pushToast({ title: copied ? 'Markdown 已复制' : '复制失败，请下载 Markdown', tone: copied ? 'success' : 'warning' })
    }
  }, [activeExperiment, pushToast])

  const exportJson = useCallback(() => {
    if (!activeExperiment) return
    downloadText(createJsonFilename(activeExperiment), experimentToJson(activeExperiment), 'application/json;charset=utf-8')
    pushToast({ title: 'JSON 备份已导出', tone: 'success' })
  }, [activeExperiment, pushToast])

  const editorValues = activeExperiment ? experimentToEditorValues(activeExperiment) : null
  const moduleCompletion = activeExperiment ? getModuleCompletion(activeExperiment) : undefined
  const moduleIssues = activeExperiment ? getModuleIssues(activeExperiment) : undefined
  const deleteTarget = experiments.find((item) => item.id === deleteTargetId)

  return (
    <>
      <AppShell
        activeView={view}
        onHome={goHome}
        onNewExperiment={createNewExperiment}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {view === 'editor' && activeExperiment && editorValues ? (
          <EditorPage
            experimentId={activeExperiment.id}
            values={editorValues}
            status={activeExperiment.status}
            lastSavedAt={formatSavedAt(activeExperiment.updatedAt)}
            saveState={saveState}
            aiState="complete"
            completion={getCompletionPercentage(activeExperiment)}
            moduleCompletion={moduleCompletion}
            moduleIssues={moduleIssues}
            optimizingHypothesisId={optimizingHypothesisId}
            onChange={updateEditorValues}
            onSave={saveNow}
            onBack={goHome}
            onOpenSettings={() => setSettingsOpen(true)}
            onExportMarkdown={exportMarkdown}
            onCopyMarkdown={() => { void copyMarkdown() }}
            onExportJson={exportJson}
            onOptimizeHypothesis={(id) => { void optimizeHypothesis(id) }}
            onRecalculateSample={recalculateSample}
          />
        ) : (
          <HomePage
            projects={experiments.map(experimentToSummary)}
            generating={generating}
            onGenerate={generate}
            onUseDemo={useDemo}
            onOpenProject={openExperiment}
            onRenameProject={renameProject}
            onDuplicateProject={duplicateProject}
            onDeleteProject={setDeleteTargetId}
            onImportJson={() => importInputRef.current?.click()}
          />
        )}
      </AppShell>

      <input
        ref={importInputRef}
        className="sr-only"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importJsonFile(file)
          event.target.value = ''
        }}
      />

      <ModelSettingsDrawer
        open={settingsOpen}
        value={settings}
        connectionState={connectionState}
        connectionMessage={connectionMessage}
        onChange={setSettings}
        onSave={persistSettings}
        onClose={() => setSettingsOpen(false)}
        onTestConnection={() => { void testModelConnection() }}
        onClear={clearSettings}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="删除这份实验？"
        description={`“${deleteTarget?.overview.name ?? ''}”将从当前浏览器的本地项目中删除。此操作无法撤销，请先导出 JSON 备份。`}
        confirmLabel="删除实验"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {generating && (
        <div className="gl-generation-layer" role="dialog" aria-modal="true" aria-labelledby="generation-title">
          <div className="gl-generation-panel">
            <div className="gl-generation-heading">
              <div>
                <p className="gl-eyebrow">AI STRUCTURING / IN PROGRESS</p>
                <h2 id="generation-title">正在搭建完整实验工作稿</h2>
                <p>正在生成假设、分组、指标、样本规划、风险与决策规则，通常需要几十秒。</p>
              </div>
              <Button variant="secondary" onClick={() => abortControllerRef.current?.abort()}>取消生成</Button>
            </div>
            <EditorSkeleton />
          </div>
        </div>
      )}

      {aiFailure && (
        <div className="gl-modal-backdrop" role="presentation">
          <div className="gl-modal gl-ai-error-modal" role="alertdialog" aria-modal="true" aria-labelledby="ai-error-title">
            <div className="gl-modal__header">
              <span className="gl-modal__mark gl-modal__mark--danger"><AlertTriangle size={20} /></span>
              <button className="gl-icon-button" type="button" onClick={() => setAiFailure(null)} aria-label="关闭"><X size={18} /></button>
            </div>
            <h2 id="ai-error-title">{aiFailure.title}</h2>
            <p>{aiFailure.message}</p>
            <p className="gl-ai-error-suggestion">{aiFailure.suggestion}</p>
            {aiFailure.rawResponse && (
              <details className="gl-raw-response">
                <summary><Braces size={15} /> 查看已脱敏的原始响应</summary>
                <pre>{aiFailure.rawResponse}</pre>
              </details>
            )}
            <div className="gl-modal__actions">
              <Button variant="secondary" onClick={() => setAiFailure(null)}>关闭</Button>
              <Button onClick={() => {
                setAiFailure(null)
                retryRef.current?.()
              }}>重新生成</Button>
            </div>
          </div>
        </div>
      )}

      <ToastRegion messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
    </>
  )
}
