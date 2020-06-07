import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import mainSvelte from 'rollup-plugin-svelte'
import hotSvelte from 'rollup-plugin-svelte-hot'
import autoPreprocess from 'svelte-preprocess'
import { versionsAndTestEmoji } from './bin/versionsAndTestEmoji'

const dev = process.env.NODE_ENV !== 'production'
const svelte = dev ? hotSvelte : mainSvelte

// Build Database.test.js and Picker.js as separate modules at build times so that they are properly tree-shakeable.
// Most of this has to happen because customElements.define() has side effects
const baseConfig = {
  plugins: [
    resolve(),
    cjs(),
    json(),
    replace({
      'process.env.NODE_ENV': dev ? '"development"' : '"production"',
      'process.env.PERF': !!process.env.PERF,
      'process.env.VERSIONS_AND_TEST_EMOJI': JSON.stringify(versionsAndTestEmoji)
    }),
    replace({
      '../database/Database.js': './database.js',
      delimiters: ['', '']
    }),
    svelte({
      css: true,
      customElement: true,
      dev,
      preprocess: autoPreprocess()
    })
  ],
  external: [
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
