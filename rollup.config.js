import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip'
import analyze from 'rollup-plugin-analyzer'
import { minifyHtmlLiteralsRollupPlugin } from './config/minifyHtmlLiteralsRollupPlugin.js'
import { buildStylesRollupPlugin } from './config/buildStylesRollupPlugin.js'

const { NODE_ENV, DEBUG, PERF } = process.env
const dev = NODE_ENV !== 'production'

// Build Database.test.js and Picker.js as separate modules at build times so that they are properly tree-shakeable.
// Most of this has to happen because customElements.define() has side effects
const baseConfig = {
  plugins: [
    resolve(),
    cjs(),
    replace({
      'import.meta.env.MODE': dev ? '"development"' : '"production"',
      'import.meta.env.PERF': !!PERF,
      preventAssignment: true
    }),
    replace({
      '\'../database/Database.js\'': '\'./database.js\'',
      delimiters: ['', ''],
      preventAssignment: true
    }),
    minifyHtmlLiteralsRollupPlugin(),
    buildStylesRollupPlugin(),
    strip({
      include: ['**/*.js'],
      functions: [
        (!dev && !PERF) && 'performance.*',
        !dev && 'console.log'
      ].filter(Boolean)
    }),
    DEBUG && analyze({ summaryOnly: true })
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
  },
  {
    input: './src/trimEmojiData.js',
    output: './trimEmojiData.js'
  },
  {
    input: './src/trimEmojiData.js',
    output: './trimEmojiData.cjs',
    format: 'cjs'
  }
]

export default entryPoints.map(({ input, output, format = 'es', external = [], onwarn }) => {
  return {
    input,
    output: {
      format,
      file: output,
      sourcemap: dev,
      exports: 'auto'
    },
    external: [...baseConfig.external, ...external],
    plugins: baseConfig.plugins,
    onwarn
  }
})
