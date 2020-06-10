import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: './index.js',
    output: {
      file: './bundle.js',
      format: 'iife',
      name: 'emojiPickerElement'
    },
    plugins: [
      terser()
    ]
  },
  {
    input: './database.js',
    output: {
      file: './database-bundle.js',
      format: 'iife',
      name: 'EmojiPickerDatabase'
    },
    plugins: [
      terser()
    ]
  }
]
