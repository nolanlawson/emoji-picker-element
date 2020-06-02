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

// Build Database.js and Picker.js as separate modules at build times so that they are properly tree-shakeable.
// Most of this has to happen because customElements.define() has side effects
const baseConfig = {
  plugins: [
    resolve(),
    cjs(),
    json(),
    replace({
      'process.env.VERSIONS_AND_TEST_EMOJI': JSON.stringify(versionsAndTestEmoji)
    }),
    replace({
      '../../../database/Database.js': './Database.js',
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
    '../../../database/Database.js'
  ]
}

const formats = ['es', 'cjs']
const entryPoints = [
  {
    input: './src/svelte/components/Picker/Picker.svelte',
    output: 'Picker.js'
  },
  {
    input: './src/database/Database.js',
    output: 'Database.js'
  }
]

export default formats.map(format => (entryPoints.map(({ input, output }) => ({
  ...baseConfig,
  input,
  output: {
    format,
    file: `dist/${format}/${output}`,
    sourcemap: dev
  }
})))).flat()
