import sass from 'sass'
import csso from 'csso'

export function buildStyles () {
  const file = './src/picker/styles/picker.scss'
  const css = sass.renderSync({ file, outputStyle: 'compressed' }).css.toString('utf8')
  return csso.minify(css).css
}
