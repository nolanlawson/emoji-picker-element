import cjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'

const baseConfig = {
  input: './src/index.js',
  plugins: [
    resolve(),
    cjs(),
    svelte()
  ]
}

export default [
  {
    ...baseConfig,
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs'
    }
  },
  {
    ...baseConfig,
    output: {
      file: 'dist/index.es.js',
      format: 'es'
    }
  }
]
