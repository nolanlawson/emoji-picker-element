// @rollup/plugin-strip doesn't properly strip performance.mark/measure

/* istanbul ignore next */
const hasPerfMarks = typeof performance !== 'undefined' && performance.mark && performance.measure

export function mark (str) {
  /* istanbul ignore next */
  if ((process.env.NODE_ENV !== 'production' || process.env.PERF) && hasPerfMarks) {
    performance.mark(str)
  }
}

export function stop (str) {
  /* istanbul ignore next */
  if ((process.env.NODE_ENV !== 'production' || process.env.PERF) && hasPerfMarks) {
    performance.measure(str, str)
  }
}
