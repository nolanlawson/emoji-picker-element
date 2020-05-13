export function assertNonEmptyString (str) {
  if (typeof str !== 'string' || !str) {
    throw new Error('expected a non-empty string, got: ' + str)
  }
}