import * as sass from 'sass'
import { minify } from 'csso'

export function buildStyles () {
  const file = './src/picker/styles/picker.scss'
  const css = sass.compile(file, { style: 'compressed' }).css
  return minify(css).css
}
