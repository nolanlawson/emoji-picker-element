const babelJest = require('babel-jest').default

module.exports = babelJest.createTransformer({
  presets: [],
  plugins: [
    '@babel/plugin-transform-modules-commonjs'
  ]
})
