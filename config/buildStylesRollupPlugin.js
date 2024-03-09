import * as sass from 'sass'
import { minify } from 'csso'

export function buildStylesRollupPlugin () {
  return {
    name: 'build-styles-from-scss',
    transform (content, id) {
      if (id.includes('picker.scss')) {
        const css = sass.compile(id, { style: 'compressed' }).css
        return `export default ${JSON.stringify(minify(css).css)}`
      }
    }
  }
}
