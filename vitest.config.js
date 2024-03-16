import { defineConfig } from 'vitest/config'
import { minifyHtmlLiteralsRollupPlugin } from './config/minifyHtmlLiteralsRollupPlugin.js'
import { buildStylesRollupPlugin } from './config/buildStylesRollupPlugin.js'

export default defineConfig({
  plugins: [
    minifyHtmlLiteralsRollupPlugin(),
    buildStylesRollupPlugin()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './config/vitest.setup.js'
    ],
    testTimeout: 60000,
    coverage: {
      provider: 'istanbul',
      include: [
        'src/'
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
