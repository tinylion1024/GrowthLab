# GrowthLab

GrowthLab 是一个本地优先、纯静态部署的 AI 增长实验工作台。它把模糊的增长问题整理为可编辑的结构化实验方案，覆盖问题拆解、核心假设、实验设计、目标人群、指标、样本量、文案、风险、决策规则、上线检查和复盘模板。

[在线体验](https://tinylion1024.github.io/GrowthLab/) · [部署状态](https://github.com/tinylion1024/GrowthLab/actions/workflows/deploy-pages.yml)

无需注册或配置模型，打开在线版本后点击“使用示例体验”，即可载入完整 Demo。

## 项目预览

![GrowthLab 实验编辑器工作台](docs/images/growthlab-workbench.png)

截图使用内置 Demo 数据，不包含真实业务信息或 API 凭据。

## 从问题到实验交付

1. 输入增长问题与业务背景，或直接载入完整 Demo。
2. 使用兼容 OpenAI Chat Completions 的模型生成结构化初稿。
3. 在 12 个实验模块中继续编辑假设、指标、样本量、文案和风险等内容。
4. 完成上线检查与决策规则，导出 Markdown 方案或 JSON 备份。

## 主要能力

- 完整 Demo：无需配置模型即可体验全部模块。
- BYOK AI：兼容 OpenAI Chat Completions 格式的服务，支持自定义 Base URL、模型和请求路径。
- 结构化校验：模型输出先解析 JSON，再用 Zod 校验；失败时提供针对性提示和已脱敏原始响应。
- 本地项目：多项目创建、重命名、复制、删除、搜索、自动保存和损坏数据恢复。
- 实验规划：两独立样本比例的确定性样本量估算、实验周期估算和统计边界提醒。
- 交付导出：复制或下载 Markdown，下载/导入 JSON 备份。
- 响应式编辑器：桌面双栏、移动端单栏，支持键盘焦点、跳转链接、ARIA 和减少动画偏好。

## 技术栈

| 领域 | 方案 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite 7、Tailwind CSS 4 |
| 表单与状态 | React Hook Form、Zustand |
| 数据校验 | Zod |
| 测试与质量 | Vitest、Testing Library、ESLint、TypeScript |
| 部署 | GitHub Actions、GitHub Pages |

## 本地开发

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

常用校验：

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

生产产物输出到 `dist/`，可由任意静态文件服务器托管。

## 模型配置

在页面右上角打开“模型设置”，填写：

- API Base URL，例如 `https://api.openai.com/v1`
- API Key
- 模型名称
- 可选的 Chat Completions Path、Temperature、最大输出 Token 和 JSON Mode

API Key 只保存在内存和当前会话的 `sessionStorage`，不会进入实验数据、`localStorage`、导出文件、源码或 GitHub Actions。选择“记住非敏感设置”时，仅持久化 Base URL、模型名称和 Temperature。

浏览器直连要求服务商允许当前站点的 CORS。公共多用户生产环境不应向前端分发平台密钥，应改用可信的 serverless API proxy。

## 样本量计算边界

内置计算器适用于两独立样本比例的规划估算，支持单/双侧检验、不等分流和多个实验组。结果不替代正式统计评审；实验应覆盖完整业务周期，不应因为短期显著随意提前停止。连续型指标需要历史均值和方差，GrowthLab 不会在缺少参数时伪造精确样本量。

## GitHub Pages

工作流位于 `.github/workflows/deploy-pages.yml`。推送到 `main` 后会依次执行类型检查、Lint、测试和生产构建，再使用 GitHub 官方 Pages Actions 部署 `dist/`。Vite 会在 GitHub Actions 中根据仓库名自动设置 Pages base path，本地开发仍使用 `/`。

当前站点已部署在 <https://tinylion1024.github.io/GrowthLab/>。Fork 后首次启用时，需要在仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。

## 数据与安全

- 实验保存在当前浏览器的 `localStorage`。
- JSON 导入经过迁移和 Zod 结构校验。
- 导出会递归剥离疑似密钥、Token、Authorization 和 Secret 字段。
- API 错误原始响应在展示前会做密钥脱敏。
- 仓库和 Pages 工作流不包含任何 API Key。

## 提交与发布

本项目遵循 Conventional Commits，并将变更拆成可独立审阅的原子提交。自动化代理不会执行 `git push`；确认本地提交后由人类手动推送：

```bash
git log --oneline --decorate -n 10
git push origin main
```
