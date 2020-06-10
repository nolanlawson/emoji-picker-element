// @rollup/plugin-strip doesn't strip console.logs properly
import { isJest } from '../picker/utils/isJest'

export function log () {
  if (process.env.NODE_ENV !== 'production' && !isJest()) {
    console.log(...arguments)
  }
}

export function warn () {
  /* istanbul ignore if */
  if (!isJest()) {
    console.warn(...arguments)
  }
}
