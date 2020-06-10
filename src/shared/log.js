// @rollup/plugin-strip doesn't strip console.logs properly

export function log () {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.log(...arguments)
  }
}

export function warn () {
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'test') {
    console.warn(...arguments)
  }
}
