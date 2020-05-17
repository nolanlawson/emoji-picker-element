export function assertNumber (number) {
  if (typeof number !== 'number') {
    throw new Error('expected a number, got: ' + number)
  }
}
