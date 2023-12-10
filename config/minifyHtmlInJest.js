import { minifyHTMLLiterals } from 'minify-html-literals'

export default {
  processAsync (source) {
    return minifyHTMLLiterals(source)
  }
}
