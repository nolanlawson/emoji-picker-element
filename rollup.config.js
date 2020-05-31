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

const baseConfig = {
  plugins: [
    resolve(),
    cjs({
      exclude: ['node_modules/lodash-es/**']
    }),
    json(),
    replace({
      'process.env.VERSIONS_AND_TEST_EMOJI': JSON.stringify(versionsAndTestEmoji)
    }),
    svelte({
      css: true,
      customElement: true,
      dev,
      preprocess: autoPreprocess()
    })
  ]
}

const formats = ['es', 'cjs']
const entryPoints = [
  {
    input: './src/index.js',
    output: 'index.js'
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
