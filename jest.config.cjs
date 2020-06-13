module.exports = {
  testMatch: [
    '<rootDir>/test/spec/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.js$': './config/babelJestTransform.cjs',
    '^.+\\.svelte$': ['svelte-jester', {
      preprocess: true,
      compilerOptions: {
        css: true,
        customElement: true,
        dev: false
      }
    }]
  },
  moduleFileExtensions: ['js', 'svelte'],
  testPathIgnorePatterns: ['node_modules'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es|if-emoji)'],
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
  ]
}
