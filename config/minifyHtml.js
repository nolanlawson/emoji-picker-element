import { minifyHTMLLiterals } from 'minify-html-literals'

export function minifyHtml (source) {
  // minify the html so that the output is smaller
  // the css minifier breaks inline styles, so skip it
  const { code, map } = minifyHTMLLiterals(source, { minifyOptions: { minifyCSS: false } })
  return { code, map }
}
