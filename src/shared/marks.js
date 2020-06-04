// @rollup/plugin-strip doesn't properly strip performance.mark/measure

const hasPerfMarks = typeof performance !== 'undefined' && performance.mark && performance.measure

export function mark (str) {
  if (hasPerfMarks && (process.env.NODE_ENV !== 'production' || process.env.PERF)) {
    performance.mark(str)
  }
}

export function stop (str) {
  if (hasPerfMarks && (process.env.NODE_ENV !== 'production' || process.env.PERF)) {
    performance.measure(str, str)
  }
}
