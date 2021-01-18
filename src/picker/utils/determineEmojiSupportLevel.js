// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import { mark, stop } from '../../shared/marks'
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'
import { testEmojiSupported } from './testEmojiSupported'

export function determineEmojiSupportLevel () {
  mark('determineEmojiSupportLevel')
  let res
  for (const [emoji, version] of Object.entries(versionsAndTestEmoji)) {
    /* istanbul ignore else */
    if (testEmojiSupported(emoji)) {
      res = version
    } else {
      break
    }
  }
  stop('determineEmojiSupportLevel')
  return res
}
