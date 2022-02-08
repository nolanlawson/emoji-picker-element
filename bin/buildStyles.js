import sass from 'sass'
import { minify } from 'csso'

export function buildStyles () {
  const file = './src/picker/styles/picker.scss'
  const css = sass.renderSync({ file, outputStyle: 'compressed' }).css.toString('utf8')
  return minify(css).css
}
