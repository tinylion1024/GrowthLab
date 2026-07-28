import { AlertTriangle, Calculator, Clock3, Sigma, Users } from 'lucide-react'
import type { SamplePlanValue } from '../types'
import { FieldInput, FieldSelect, FieldTextarea, FormField } from '../ui/FormField'
import { SectionHeader } from '../ui/SectionHeader'

export interface SamplePlanFormProps {
  value: SamplePlanValue
  onChange: (value: SamplePlanValue) => void
  onRecalculate: (value: SamplePlanValue) => void
}

export function SamplePlanForm({ value, onChange, onRecalculate }: SamplePlanFormProps) {
  const set = <Key extends keyof SamplePlanValue>(key: Key, next: SamplePlanValue[Key]) => {
    const updated = { ...value, [key]: next }
    onChange(updated)
    if (['baselineRate', 'targetRate', 'relativeMde', 'alpha', 'power', 'sidedness', 'groupCount', 'dailyTraffic', 'trafficPercentage', 'splitRatios'].includes(key)) {
      onRecalculate(updated)
    }
  }
  const hasResult = typeof value.samplePerGroup === 'number' && typeof value.totalSample === 'number'

  return (
    <div className="gl-module">
      <SectionHeader eyebrow="07 / SAMPLE PLAN" title="样本量和实验周期" description="使用两独立样本比例近似计算；结果用于排期估算，不替代统计评审。" />
      <div className="gl-calculator-layout">
        <section className="gl-calculator">
          <div className="gl-calculator__heading"><Calculator size={19} /><h3>确定性参数</h3></div>
          <div className="gl-form-grid">
            <FormField label="指标类型" htmlFor="sample-kind" className="gl-span-2"><FieldSelect id="sample-kind" value={value.metricKind} onChange={(event) => set('metricKind', event.target.value as SamplePlanValue['metricKind'])}><option value="proportion">比例类指标</option><option value="continuous">连续型指标</option><option value="other">其他</option></FieldSelect></FormField>
            <FormField label="基线转化率 %" htmlFor="sample-baseline"><FieldInput id="sample-baseline" type="number" min="0" max="100" step="0.1" value={value.baselineRate} onChange={(event) => set('baselineRate', event.target.value)} /></FormField>
            <FormField label="目标转化率 %" htmlFor="sample-target"><FieldInput id="sample-target" type="number" min="0" max="100" step="0.1" value={value.targetRate} onChange={(event) => set('targetRate', event.target.value)} /></FormField>
            <FormField label="相对 MDE %" htmlFor="sample-mde" hint="目标值为空时使用"><FieldInput id="sample-mde" type="number" min="0" step="0.1" value={value.relativeMde} onChange={(event) => set('relativeMde', event.target.value)} /></FormField>
            <FormField label="Alpha" htmlFor="sample-alpha"><FieldInput id="sample-alpha" type="number" min="0.001" max="0.2" step="0.01" value={value.alpha} onChange={(event) => set('alpha', event.target.value)} /></FormField>
            <FormField label="Power" htmlFor="sample-power"><FieldInput id="sample-power" type="number" min="0.5" max="0.99" step="0.05" value={value.power} onChange={(event) => set('power', event.target.value)} /></FormField>
            <FormField label="检验方向" htmlFor="sample-sidedness"><FieldSelect id="sample-sidedness" value={value.sidedness} onChange={(event) => set('sidedness', event.target.value as SamplePlanValue['sidedness'])}><option value="two-sided">双侧检验</option><option value="one-sided">单侧检验</option></FieldSelect></FormField>
            <FormField label="实验组数量" htmlFor="sample-groups"><FieldInput id="sample-groups" type="number" min="1" max="10" value={value.groupCount} onChange={(event) => set('groupCount', Number(event.target.value))} /></FormField>
            <FormField label="每日符合条件流量" htmlFor="sample-traffic"><FieldInput id="sample-traffic" type="number" min="0" value={value.dailyTraffic} onChange={(event) => set('dailyTraffic', event.target.value)} /></FormField>
            <FormField label="实验流量占比 %" htmlFor="sample-traffic-percentage"><FieldInput id="sample-traffic-percentage" type="number" min="1" max="100" value={value.trafficPercentage} onChange={(event) => set('trafficPercentage', event.target.value)} /></FormField>
            <FormField label="各组分流比例" htmlFor="sample-splits" className="gl-span-2" hint="逗号分隔，例如 50,50"><FieldInput id="sample-splits" value={value.splitRatios} onChange={(event) => set('splitRatios', event.target.value)} /></FormField>
          </div>
        </section>
        <aside className="gl-sample-result" aria-live="polite">
          <div className="gl-sample-result__folio">CALCULATION / ESTIMATE</div>
          {value.metricKind !== 'proportion' ? (
            <div className="gl-sample-result__empty">
              <Sigma size={28} />
              <h3>需要补充历史方差</h3>
              <p>连续型或其他指标不能用比例近似得出精确样本量。请补充均值、标准差等历史数据。</p>
            </div>
          ) : hasResult ? (
            <>
              <div className="gl-stat"><Users size={18} /><span>每组建议样本量</span><strong>{value.samplePerGroup?.toLocaleString()}</strong></div>
              <div className="gl-stat"><Sigma size={18} /><span>总样本量</span><strong>{value.totalSample?.toLocaleString()}</strong></div>
              <div className="gl-stat gl-stat--accent"><Clock3 size={18} /><span>预计所需天数</span><strong>{value.estimatedDays ? `${value.estimatedDays} 天` : '待补充流量'}</strong></div>
              <div className="gl-sample-result__note"><strong>运行建议</strong><p>{value.recommendation}</p></div>
            </>
          ) : (
            <div className="gl-sample-result__empty"><Calculator size={28} /><h3>等待完整参数</h3><p>填入有效的基线、目标与流量后，将自动计算样本量和预计天数。</p></div>
          )}
        </aside>
      </div>
      <div className="gl-callout gl-callout--warning">
        <AlertTriangle size={18} />
        <div>
          <strong>读数边界</strong>
          <p>样本量是估算值。实验至少覆盖完整业务周期，不建议因短期显著提前停止；多实验组需处理多重比较。</p>
        </div>
      </div>
      <FormField label="计算假设与说明" htmlFor="sample-assumptions">
        <FieldTextarea id="sample-assumptions" rows={4} value={value.assumptions.join('\n')} onChange={(event) => set('assumptions', event.target.value.split('\n'))} />
      </FormField>
      <FormField label="AI 规划建议" htmlFor="sample-ai-advice">
        <FieldTextarea id="sample-ai-advice" rows={3} value={value.aiAdvice} onChange={(event) => set('aiAdvice', event.target.value)} />
      </FormField>
      {value.warnings.length > 0 && (
        <div className="gl-callout gl-callout--warning">
          <AlertTriangle size={18} />
          <div><strong>计算提醒</strong><p>{value.warnings.join('；')}</p></div>
        </div>
      )}
    </div>
  )
}
