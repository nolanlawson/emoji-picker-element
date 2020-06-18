import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import mainSvelte from 'rollup-plugin-svelte'
import hotSvelte from 'rollup-plugin-svelte-hot'
import preprocess from 'svelte-preprocess'
import analyze from 'rollup-plugin-analyzer'
import cssnano from 'cssnano'

const dev = process.env.NODE_ENV !== 'production'
const svelte = dev ? hotSvelte : mainSvelte

// Build Database.test.js and Picker.js as separate modules at build times so that they are properly tree-shakeable.
// Most of this has to happen because customElements.define() has side effects
const baseConfig = {
  plugins: [
    resolve(),
    cjs(),
    replace({
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      'process.env.PERF': !!process.env.PERF
    }),
    replace({
      '\'../database/Database.js\'': '\'./database.js\'',
      delimiters: ['', '']
    }),
    svelte({
      css: true,
      customElement: false,
      dev,
      preprocess: preprocess({
        scss: true,
        postcss: {
          plugins: [
            cssnano({
              preset: 'default'
            })
          ]
        }
      })
    }),
    !dev && analyze({ summaryOnly: true })
  ],
  external: [
    './database.js',
    '../database/Database.js'
  ]
}

const entryPoints = [
  {
    input: './src/picker/PickerElement.js',
    output: './picker.js'
  },
  {
    input: './src/database/Database.js',
    output: './database.js'
  }
]

export default entryPoints.map(({ input, output }) => ({
  ...baseConfig,
  input,
  output: {
    format: 'es',
    file: output,
    sourcemap: dev
  }
}))
