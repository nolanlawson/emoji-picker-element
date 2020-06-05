// @rollup/plugin-strip doesn't properly strip performance.mark/measure

export function mark (str) {
  if (process.env.NODE_ENV !== 'production' || process.env.PERF) {
    performance.mark(str)
  }
}

export function stop (str) {
  if (process.env.NODE_ENV !== 'production' || process.env.PERF) {
    performance.measure(str, str)
  }
}
