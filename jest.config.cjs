module.exports = {
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.svelte$': 'jest-transform-svelte',
    '^.+\\.js$': './babelJestTransform.cjs'
  },
  moduleFileExtensions: ['js', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['node_modules'],
  bail: false,
  verbose: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js']
}
