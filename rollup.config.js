import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip'
import preprocess from 'svelte-preprocess'
import analyze from 'rollup-plugin-analyzer'
import { minifyHTMLLiterals } from 'minify-html-literals'
import { buildStyles } from './bin/buildStyles.js'

const { NODE_ENV, DEBUG } = process.env
const dev = NODE_ENV !== 'production'

const preprocessConfig = preprocess()

const origMarkup = preprocessConfig.markup
// minify the HTML by removing extra whitespace
// TODO: this is fragile, but it also results in a lot of bundlesize savings. let's find a better solution
preprocessConfig.markup = async function () {
  const res = await origMarkup.apply(this, arguments)

  // remove whitespace
  res.code = res.code.replace(/([>}])\s+([<{])/sg, '$1$2')

  return res
}

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
    {
      name: 'minify-html-in-tag-template-literals',
      transform (content, id) {
        if (id.includes('PickerTemplate.js')) {
          // minify the html so that the output is smaller
          const { code, map } = minifyHTMLLiterals(content)
          return { code, map }
        }
      }
    },
    strip({
      include: ['**/*.js'],
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
    // for backwards compat
    input: './src/picker/PickerElement.js',
    output: './svelte.js'
  }
]

export default entryPoints.map(({ input, output, format = 'es', external = [], plugins = [], onwarn }) => {
  return {
    input,
    output: {
      format,
      file: output,
      sourcemap: dev,
      exports: 'auto'
    },
    external: [...baseConfig.external, ...external],
    plugins: [...baseConfig.plugins, ...plugins],
    onwarn
  }
})
