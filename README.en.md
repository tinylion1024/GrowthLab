# GrowthLab — AI Growth Experiment Workbench

<p align="center">
  Turn ambiguous growth questions into structured, editable, testable, and exportable experiment plans.
</p>

<p align="center">
  <a href="https://tinylion1024.github.io/GrowthLab/"><strong>Live Demo</strong></a>
  ·
  <a href="README.md">简体中文</a>
  ·
  <a href="https://github.com/tinylion1024/GrowthLab/issues">Feedback</a>
</p>

<p align="center">
  <a href="https://tinylion1024.github.io/GrowthLab/"><img alt="Live Demo" src="https://img.shields.io/badge/Live_Demo-Open_GrowthLab-0f766e?style=flat-square"></a>
  <a href="https://github.com/tinylion1024/GrowthLab/actions/workflows/deploy-pages.yml"><img alt="Deploy" src="https://github.com/tinylion1024/GrowthLab/actions/workflows/deploy-pages.yml/badge.svg"></a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white">
</p>

GrowthLab helps product managers, growth teams, indie hackers, and marketers design growth experiments, plan A/B tests, and deliver consistent experiment documents. No account or model configuration is required: open the live app and select **使用示例体验** (use the sample) to explore the complete workflow in your browser.

> If GrowthLab is useful to you, consider giving it a Star. It helps more builders working on product growth and experimentation discover the project.

## Preview

[![GrowthLab AI growth experiment editor with overview, metrics, sample size, and launch checklist](public/images/growthlab-workbench.png)](https://tinylion1024.github.io/GrowthLab/)

The screenshot uses built-in demo data and contains no real business information or API credentials.

## Why GrowthLab?

A reliable growth experiment needs more than a hypothesis. It also needs an audience, success metrics, sample size, duration, risk controls, decision rules, and a retrospective template. Generic AI chats often return prose that is difficult to maintain. GrowthLab organizes the work into 12 editable modules, adds deterministic statistical planning, and exports a reusable deliverable.

| Common problem | How GrowthLab helps |
| --- | --- |
| The growth question is too vague | Guides you from problem analysis and hypotheses to an experiment design |
| AI output omits fields or changes shape | Parses JSON and validates it with Zod, with actionable error feedback |
| A/B test sample size is based on guesswork | Estimates sample size and duration for two independent proportions |
| Plans are scattered across chats and documents | Keeps local projects with autosave and Markdown/JSON export |
| Business data or credentials may leak | Stores projects locally and excludes API keys from project data and exports |

## Try it in 60 seconds

1. Open the [GrowthLab live demo](https://tinylion1024.github.io/GrowthLab/).
2. Select **使用示例体验** (use the sample) to load a complete growth experiment.
3. Review and edit the problem, hypotheses, design, metrics, sample size, copy, risks, and launch checklist.
4. Export the plan as Markdown or download a JSON backup.

To generate a plan with AI, connect an OpenAI Chat Completions-compatible provider in **模型设置** (model settings). The demo, local editor, statistical calculator, and exports work without a model.

## Core capabilities

- **Structured experiment design:** problem analysis, hypotheses, experiment design, audience, metrics, sample plan, copy, risks, decision rules, launch checklist, and retrospective.
- **Bring your own model:** configure the API base URL, model, request path, temperature, maximum output tokens, and JSON mode.
- **Validated AI output:** parse JSON and validate it with Zod; redact sensitive values from displayed errors and raw responses.
- **A/B test planning:** estimate sample size for two independent proportions with one- or two-sided tests, unequal allocation, and multiple variants.
- **Local project management:** create, rename, duplicate, delete, search, autosave, and recover projects in the browser.
- **Portable delivery:** copy or download Markdown and import or export JSON backups.
- **Responsive editor:** desktop two-column and mobile single-column layouts with baseline keyboard, ARIA, skip-link, and reduced-motion support.

## Who is it for?

- Product and growth teams testing activation, retention, conversion, or revenue hypotheses.
- Data and experimentation teams standardizing A/B test design, sample size, and decision rules.
- Indie hackers validating product-market fit, pricing, landing pages, or onboarding.
- Teams that want AI to produce an actionable experiment document instead of one-off advice.

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| Forms and state | React Hook Form, Zustand |
| Validation | Zod |
| Quality | Vitest, Testing Library, ESLint, TypeScript |
| Deployment | GitHub Actions, GitHub Pages |

## Local development

Node.js 20 or newer is required.

```bash
git clone https://github.com/tinylion1024/GrowthLab.git
cd GrowthLab
npm install
npm run dev
```

Run the quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The production bundle is written to `dist/` and can be hosted by any static file server.

## Model and data security

The API key stays in memory and the current tab's `sessionStorage`. It is never included in experiment data, `localStorage`, exports, source code, or GitHub Actions. When non-sensitive settings are remembered, only the base URL, model name, and temperature are persisted.

Direct browser requests require the provider to allow CORS from the site origin. A public multi-user deployment should use a trusted serverless proxy instead of distributing platform credentials to the frontend.

Projects are stored in the current browser's `localStorage`. Content is sent externally only when you explicitly call the model provider you configured.

## Statistical scope

The built-in calculator provides planning estimates for two independent proportions. It supports one- and two-sided tests, unequal allocation, and multiple experiment variants. It does not replace a formal statistical review, and GrowthLab does not fabricate precise sample sizes for continuous metrics when historical mean and variance are unavailable.

## FAQ

### What is GrowthLab?

GrowthLab is a local-first AI growth experiment workbench that turns growth questions into structured experiment designs, A/B test plans, and exportable experiment documents.

### Is GrowthLab free to use?

Yes. The live demo, local editor, statistical calculator, and export tools require no account. AI generation uses the model provider you configure, whose pricing may apply.

### Does GrowthLab upload my project data?

No. GrowthLab is a static frontend and stores projects in your browser. Only an explicit AI request sends its content to your configured model provider.

### How is it different from a generic AI chat?

GrowthLab provides a fixed experiment structure, schema validation, deterministic sample-size calculations, local project management, and standardized exports for continuous editing and delivery.

### Which AI providers are supported?

Any provider with an OpenAI Chat Completions-compatible endpoint that accepts browser CORS requests. You can configure its base URL, model, and request parameters.

## Contributing

Bug reports, product feedback, and feature ideas are welcome in [GitHub Issues](https://github.com/tinylion1024/GrowthLab/issues). You can also help more builders discover GrowthLab by starring, sharing, or forking the project.
