export function applySkinTone (str, skinTone) {
  return str + '\ud83c' + String.fromCodePoint(0xdffb + skinTone - 1)
}
