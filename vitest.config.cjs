import { defineConfig } from 'vitest/config'
import { minifyHtmlLiteralsRollupPlugin } from './config/minifyHtmlLiteralsRollupPlugin.js'

export default defineConfig({
  plugins: [
    minifyHtmlLiteralsRollupPlugin()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './config/jest.setup.js'
    ],
    testTimeout: 60000,
    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'lcov', 'text', 'html'],
      include: [
        'src/'
      ],
      exclude: [
        'bin/',
        'test/',
        'i18n/',
        'src/picker/i18n/'
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
})
