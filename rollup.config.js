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

const preprocessConfig = preprocess({
  scss: true,
  postcss: {
    plugins: [
      cssnano({
        preset: 'default'
      })
    ]
  }
})

const origMarkup = preprocessConfig.markup
// minify the HTML by removing extra whitespace
// TODO: this is fragile, but it also results in a lot of bundlesize savings. let's find a better solution
preprocessConfig.markup = async function () {
  const res = await origMarkup.apply(this, arguments)

  // remove whitespace
  res.code = res.code.replace(/([>}])\s+([<{])/sg, '$1$2')

  // remove data-testid (only used for testing-library)
  res.code = res.code.replace(/data-testid=".*?"/g, '')

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
      preventAssignment: true
    }),
    replace({
      '\'../database/Database.js\'': '\'./database.js\'',
      delimiters: ['', ''],
      preventAssignment: true
    }),
    svelte({
      css: true,
      customElement: true,
      dev,
      preprocess: preprocessConfig
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
