export function isJest () {
  const env = typeof process !== 'undefined' && process.env
  return env && env.NODE_ENV === 'test' // avoid rollup replacing the string so we can actually test it in prod
}
