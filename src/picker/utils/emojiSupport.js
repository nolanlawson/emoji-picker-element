import { determineEmojiSupportLevel } from './determineEmojiSupportLevel'
import { requestIdleCallback } from './requestIdleCallback'
// Check which emojis we know for sure aren't supported, based on Unicode version level
let promise
export const detectEmojiSupportLevel = () => {
  if (!promise) {
    promise = new Promise(resolve => (
      requestIdleCallback(() => (
        resolve(determineEmojiSupportLevel()) // delay so ideally this can run while IDB is first populating
      ))
    ))

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      promise.then(emojiSupportLevel => {
        console.log('emoji support level', emojiSupportLevel)
      })
    }
  }
  return promise
}
// determine which emojis containing ZWJ (zero width joiner) characters
// are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
export const supportedZwjEmojis = new Map()
