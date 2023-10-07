module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/test/spec/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.svelte$': ['svelte-jester', {
      preprocess: './config/svelte.config.js',
      compilerOptions: {
        dev: false
      }
    }]
  },
  moduleFileExtensions: ['js', 'svelte'],
  extensionsToTreatAsEsm: [".svelte"],
  testPathIgnorePatterns: ['node_modules'],
  bail: true,
  verbose: true,
  silent: false,
  setupFilesAfterEnv: [
    '<rootDir>/config/jest.setup.js'
  ],
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
    },
    './src/picker/components/Picker/Picker.svelte': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
}
