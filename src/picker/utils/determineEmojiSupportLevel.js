// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'
import { testColorEmojiSupported } from './testColorEmojiSupported'

/* istanbul ignore next */
export function determineEmojiSupportLevel () {
  performance.mark('determineEmojiSupportLevel')
  try {
    // start with latest emoji and work backwards
    for (const [emoji, version] of Object.entries(versionsAndTestEmoji)) {
      if (testColorEmojiSupported(emoji)) {
        return version
      }
    }
  } catch (e) { // canvas error
    console.log('Ignoring canvas error', e)
  } finally {
    performance.measure('determineEmojiSupportLevel', 'determineEmojiSupportLevel')
  }
  // In case of an error, be generous and just assume all emoji are supported (e.g. for canvas errors
  // due to anti-fingerprinting add-ons). Better to show some gray boxes than nothing at all.
  return Object.values(versionsAndTestEmoji)[0] // assume the first one is largest
}
