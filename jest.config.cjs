module.exports = {
  testMatch: [
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.svelte$': 'jest-transform-svelte',
    '^.+\\.js$': './config/babelJestTransform.cjs'
  },
  moduleFileExtensions: ['js', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
  bail: false,
  verbose: true,
  silent: true,
  setupFilesAfterEnv: [
    '<rootDir>/config/jest.setup.js'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'html']
}
