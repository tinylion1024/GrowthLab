import { Eye, EyeOff, KeyRound, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ModelSettingsValue } from '../types'
import { Button } from '../ui/Button'
import { FieldInput, FormField } from '../ui/FormField'

export interface ModelSettingsDrawerProps {
  open: boolean
  value: ModelSettingsValue
  connectionState?: 'idle' | 'testing' | 'success' | 'error'
  connectionMessage?: string
  onChange: (value: ModelSettingsValue) => void
  onSave: () => void
  onClose: () => void
  onTestConnection: () => void
  onClear: () => void
}

export function ModelSettingsDrawer({
  open,
  value,
  connectionState = 'idle',
  connectionMessage,
  onChange,
  onSave,
  onClose,
  onTestConnection,
  onClear,
}: ModelSettingsDrawerProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const set = <Key extends keyof ModelSettingsValue>(key: Key, next: ModelSettingsValue[Key]) =>
    onChange({ ...value, [key]: next })

  useEffect(() => {
    if (!open) setShowApiKey(false)
  }, [open])

  if (!open) return null

  return (
    <div className="gl-drawer-layer">
      <button className="gl-drawer-scrim" aria-label="关闭模型设置" onClick={onClose} type="button" />
      <aside
        className="gl-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="gl-drawer__header">
          <div>
            <p className="gl-eyebrow">BYOK / 浏览器直连</p>
            <h2 id="settings-title">模型设置</h2>
          </div>
          <button className="gl-icon-button" type="button" onClick={onClose} aria-label="关闭">
            <X size={19} />
          </button>
        </div>

        <div className="gl-security-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            <strong>密钥仅用于浏览器直接请求</strong>
            不会写入项目或上传到 GrowthLab，默认只保存在当前会话。
          </p>
        </div>

        <div className="gl-drawer__body">
          <section className="gl-settings-section">
            <h3><KeyRound size={16} /> 接口与凭据</h3>
            <FormField label="API Base URL" htmlFor="api-base" required>
              <FieldInput
                id="api-base"
                type="url"
                value={value.baseUrl}
                onChange={(event) => set('baseUrl', event.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </FormField>
            <FormField label="API Key" htmlFor="api-key" hint="不写入 localStorage">
              <div className="gl-input-with-action">
                <FieldInput
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={value.apiKey}
                  onChange={(event) => set('apiKey', event.target.value)}
                  placeholder="sk-…"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="gl-input-action"
                  onClick={() => setShowApiKey((current) => !current)}
                  aria-label={showApiKey ? '隐藏 API Key' : '显示 API Key'}
                >
                  {showApiKey ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </FormField>
            <FormField label="模型名称" htmlFor="model-name">
              <FieldInput
                id="model-name"
                value={value.model}
                onChange={(event) => set('model', event.target.value)}
                placeholder="输入兼容服务提供的模型名称"
              />
            </FormField>
          </section>

          <details className="gl-advanced-settings">
            <summary><SlidersHorizontal size={16} /> 高级请求设置</summary>
            <div className="gl-settings-grid">
              <FormField label="Temperature" htmlFor="temperature">
                <FieldInput
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={value.temperature}
                  onChange={(event) => set('temperature', Number(event.target.value))}
                />
              </FormField>
              <FormField label="最大输出 Token" htmlFor="max-tokens">
                <FieldInput
                  id="max-tokens"
                  type="number"
                  min="256"
                  step="256"
                  value={value.maxTokens}
                  onChange={(event) => set('maxTokens', Number(event.target.value))}
                />
              </FormField>
            </div>
            <FormField label="Chat Completions Path" htmlFor="request-path">
              <FieldInput
                id="request-path"
                value={value.requestPath}
                onChange={(event) => set('requestPath', event.target.value)}
                placeholder="/chat/completions"
              />
            </FormField>
            <label className="gl-switch-row">
              <span>
                <strong>优先使用 JSON Mode</strong>
                <small>不兼容时由请求层自动回退一次</small>
              </span>
              <input
                type="checkbox"
                checked={value.jsonMode}
                onChange={(event) => set('jsonMode', event.target.checked)}
              />
            </label>
          </details>

          <label className="gl-check-row">
            <input
              type="checkbox"
              checked={value.rememberNonSensitive}
              onChange={(event) => set('rememberNonSensitive', event.target.checked)}
            />
            <span>
              <strong>记住非敏感设置</strong>
              <small>仅保存 Base URL、模型名与 Temperature，不保存 API Key。</small>
            </span>
          </label>

          {connectionMessage && (
            <div className={`gl-connection gl-connection--${connectionState}`} role="status">
              {connectionMessage}
            </div>
          )}
        </div>

        <div className="gl-drawer__footer">
          <Button variant="ghost" onClick={onClear}>清除配置</Button>
          <div>
            <Button
              variant="secondary"
              loading={connectionState === 'testing'}
              onClick={onTestConnection}
              disabled={!value.baseUrl || !value.model}
            >
              测试连接
            </Button>
            <Button onClick={onSave}>保存设置</Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
