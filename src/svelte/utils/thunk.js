// Run a function once, then cache the result and return the cached result thereafter
export function thunk (func) {
  let cached
  let runOnce
  return () => {
    if (!runOnce) {
      cached = func()
      runOnce = true
    }
    return cached
  }
}
