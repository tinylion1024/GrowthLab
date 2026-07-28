import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function resolveBasePath() {
  if (!process.env.GITHUB_ACTIONS) return '/'

  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
  return repository.endsWith('.github.io') ? '/' : `/${repository}/`
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
