import { minifyHTMLLiterals } from 'minify-html-literals'

export default {
  processAsync (source, fileName) {
    return minifyHTMLLiterals(source, {
      fileName
    })
  }
}
