import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

// Unit tests for plain functions only (role rules, selectors); no DOM.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
