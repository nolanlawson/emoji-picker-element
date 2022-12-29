import { determineEmojiSupportLevel } from './determineEmojiSupportLevel'
// Check which emojis we know for sure aren't supported, based on Unicode version level
let promise
export const detectEmojiSupportLevel = () => {
  if (!promise) {
    console.log('Queueing microtask for detectEmojiSupportLevel (should occur after creating the database')
    // Delay so it can run while the IDB database is being created by the browser (on another thread).
    // In the user timings, you should see "createDatabase" happening concurrently with "determineEmojiSupportLevel".
    promise = Promise.resolve().then(() => {
      return determineEmojiSupportLevel()
    })

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
