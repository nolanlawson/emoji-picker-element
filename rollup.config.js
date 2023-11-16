import MagicString from 'magic-string'
import inject from '@rollup/plugin-inject'
import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import strip from '@rollup/plugin-strip'
import svelte from 'rollup-plugin-svelte'
import preprocess from 'svelte-preprocess'
import analyze from 'rollup-plugin-analyzer'
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
    svelte({
      compilerOptions: {
        dev,
        discloseVersion: false
      },
      preprocess: preprocessConfig,
      emitCss: false
    }),
    // make the svelte output slightly smaller
    replace({
      'options.context': 'undefined',
      'options.events': 'undefined',
      'options.immutable': 'false',
      'options.intro': 'undefined',
      'options.recover': 'false',
      // remove hydration
      'current_hydration_fragment !== null': 'false',
      'current_hydration_fragment === null': 'true',
      'hydration_fragment === null': 'true',
      'hydration_fragment !== null': 'false',
      'get_hydration_fragment(first_child)': 'null',
      // remove transitions
      'active_transitions.length': '0',
      'alternate_transitions.size': '0',
      'consequent_transitions.size': '0',
      'transitions.size': '0',
      'each_block.transitions': '[]',
      'block.transitions': 'null',
      "trigger_transitions(transitions, 'key', from)": '',
      "trigger_transitions(transitions, 'out')": '',
      '= each_item_transition': '= () => {}',
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
    external: ['svelte', 'svelte/internal'],
    // TODO: drop Svelte v3 support
    // ensure_array_like was added in Svelte v4 - we shim it to avoid breaking Svelte v3 users
    plugins: [
      {
        name: 'svelte-v3-compat',
        transform (source) {
          const magicString = new MagicString(source)
          magicString.replaceAll('ensure_array_like(', 'ensure_array_like_shim(')

          return {
            code: magicString.toString(),
            map: magicString.generateMap()
          }
        }
      },
      inject({
        ensure_array_like_shim: [
          '../../../../shims/svelte-v3-shim.js',
          'ensure_array_like_shim'
        ]
      })
    ],
    onwarn (warning) {
      if (!warning.message.includes('ensure_array_like')) { // intentionally ignore warning for unused import
        console.warn(warning.message)
      }
    }
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
