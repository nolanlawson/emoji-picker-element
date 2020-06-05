// @rollup/plugin-strip doesn't strip console.logs properly
export function log () {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...arguments)
  }
}
