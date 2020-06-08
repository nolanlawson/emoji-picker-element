const VARIATION_SELECTOR = '\uFE0F'
// const SKINTONE_MODIFIER = '\ud83c'
// const ZWJ = '\u200d'
//
// const LIGHT_SKIN_TONE = 0x1F3FB
// const LIGHT_SKIN_TONE_MODIFIER = 0xdffb
//
// export function applySkinTone (str, skinTone) {
//   if (skinTone === 0) {
//     return str
//   }
//   if (str.includes(ZWJ)) {
//     const index = str.indexOf(ZWJ)
//     return str.substring(0, index) +
//       String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) +
//       str.substring(index)
//   }
//   if (str.endsWith(VARIATION_SELECTOR)) {
//     str = str.substring(0, str.length - 1)
//   }
//   return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1)
// }

import skinTone from 'skin-tone'

const names = [
  'none',
  'white',
  'creamWhite',
  'lightBrown',
  'brown',
  'darkBrown'
]

export function applySkinTone (str, tone) {
  if (tone === 0) {
    return str
  }
  // if (str.endsWith(VARIATION_SELECTOR)) {
  //   str = str.substring(0, str.length - 1)
  // }
  return skinTone(str, names[tone])
}