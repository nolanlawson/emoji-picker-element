import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    transform: {
      '^.*PickerTemplate.js$': './config/minifyHtmlInJest.js'
    },
    setupFiles: [
      './config/jest.setup.js'
    ],
    testTimeout: 60000,
    coverageReporters: ['json', 'lcov', 'text', 'html'],
    coveragePathIgnorePatterns: [
      'bin/',
      'test/'
    ],
    coverageThreshold: {
      global: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
})
