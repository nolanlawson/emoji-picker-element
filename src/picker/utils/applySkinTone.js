const VARIATION_SELECTOR = '\ufe0f'
const SKINTONE_MODIFIER = '\ud83c'
const ZWJ = '\u200d'
const LIGHT_SKIN_TONE = 0x1F3FB
const LIGHT_SKIN_TONE_MODIFIER = 0xdffb

// TODO: this is a naive implementation, we can improve it later
export function applySkinTone (str, skinTone) {
  if (skinTone === 0) {
    return str
  }
  const zwjIndex = str.indexOf(ZWJ)
  if (zwjIndex !== -1) {
    return str.substring(0, zwjIndex) +
      String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) +
      str.substring(zwjIndex)
  }
  if (str.endsWith(VARIATION_SELECTOR)) {
    str = str.substring(0, str.length - 1)
  }
  return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1)
}
