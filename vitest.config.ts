import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['{src,scripts}/**/*.tsx?'],
      exclude: ['**/*.d.ts', '**/__tests__/**', '**/*.test.ts', '**/*.spec.ts']
    },
    restoreMocks: true
  }
})
