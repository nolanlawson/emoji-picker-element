import { minifyHTMLLiterals } from 'minify-html-literals'

function processAsync (source) {
  const { code, map } = minifyHTMLLiterals(source)
  return { code, map }
}

export default {
  processAsync
}
