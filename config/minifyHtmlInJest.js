import { minifyHtml } from './minifyHtml.js'

export default {
  processAsync (source) {
    const { code, map } = minifyHtml(source)
    return { code, map }
  }
}
