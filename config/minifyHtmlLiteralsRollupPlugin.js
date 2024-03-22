import { minifyHTMLLiterals } from 'minify-html-literals'

export function minifyHtmlLiteralsRollupPlugin () {
  return {
    name: 'minify-html-in-tag-template-literals',
    transform (content, id) {
      if (content.includes('html`')) {
        return minifyHTMLLiterals(content, {
          fileName: id
        })
      }
    }
  }
}
