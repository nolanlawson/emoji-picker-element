// @rollup/plugin-strip doesn't properly strip performance.mark/measure

const hasPerfMarks = typeof performance !== 'undefined' && performance.mark && performance.measure

export function mark (str) {
  if ((process.env.NODE_ENV !== 'production' || process.env.PERF) && hasPerfMarks) {
    performance.mark(str)
  }
}

export function stop (str) {
  if ((process.env.NODE_ENV !== 'production' || process.env.PERF) && hasPerfMarks) {
    performance.measure(str, str)
  }
}
