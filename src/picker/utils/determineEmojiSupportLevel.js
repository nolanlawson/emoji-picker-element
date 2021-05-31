// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'
import { testColorEmojiSupported } from './testColorEmojiSupported'

export function determineEmojiSupportLevel () {
  performance.mark('determineEmojiSupportLevel')
  let res
  for (const [emoji, version] of Object.entries(versionsAndTestEmoji)) {
    /* istanbul ignore else */
    if (testColorEmojiSupported(emoji)) {
      res = version
    } else {
      break
    }
  }
  performance.measure('determineEmojiSupportLevel', 'determineEmojiSupportLevel')
  return res
}
