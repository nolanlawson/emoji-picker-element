import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip'
import svelte from 'rollup-plugin-svelte'
import analyze from 'rollup-plugin-analyzer'
import { buildStyles } from './bin/buildStyles'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const svelteConfig = require('./svelte.config.cjs')

const { NODE_ENV, DEBUG } = process.env
const dev = NODE_ENV !== 'production'

// Build Database.test.js and Picker.js as separate modules at build times so that they are properly tree-shakeable.
// Most of this has to happen because customElements.define() has side effects
const baseConfig = {
  plugins: [
    resolve(),
    cjs(),
    replace({
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      'process.env.PERF': !!process.env.PERF,
      'process.env.STYLES': JSON.stringify(buildStyles()),
      preventAssignment: true
    }),
    replace({
      '\'../database/Database.js\'': '\'./database.js\'',
      delimiters: ['', ''],
      preventAssignment: true
    }),
    svelte({
      compilerOptions: {
        dev
      },
      ...svelteConfig
    }),
    // make the svelte output slightly smaller
    replace({
      'options.hydrate': 'false',
      delimiters: ['', ''],
      preventAssignment: true
    }),
    strip({
      include: ['**/*.js', '**/*.svelte'],
      functions: [
        (!dev && !process.env.PERF) && 'performance.*',
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
  },
  {
    input: './src/picker/PickerElement.js',
    output: './svelte.js',
    external: ['svelte', 'svelte/internal']
  }
]

export default entryPoints.map(({ input, output, format = 'es', external = [] }) => {
  const res = {
    ...baseConfig,
    input,
    output: {
      format,
      file: output,
      sourcemap: dev,
      exports: 'auto'
    }
  }
  res.external = [...res.external, ...external]
  return res
})
