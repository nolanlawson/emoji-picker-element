module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/test/spec/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.*PickerTemplate.js$': './config/minifyHtmlInJest.js'
  },
  moduleFileExtensions: ['js'],
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
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    },
    './src/picker/components/Picker/**/*': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
}
