// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'
import { testColorEmojiSupported } from './testColorEmojiSupported'

export function determineEmojiSupportLevel () {
  performance.mark('determineEmojiSupportLevel')
  const entries = Object.entries(versionsAndTestEmoji)
  try {
    // Country flags were already included in emoji version 1.0 but still some platforms (eg Chromium on
    // Windows 10) do not support them natively, rendering a 2-letter country code instead. This breaks
    // our assumption that if one emoji from a version is supported, all other emojis from that version
    // are too.therefore, we must treat country flags separately.
    const countryFlags = testColorEmojiSupported('🇦🇱')

    // start with latest emoji and work backwards
    for (const [emoji, version] of entries) {
      if (testColorEmojiSupported(emoji)) {
        return {
          version,
          countryFlags
        }
      }
    }
  } catch (e) { // canvas error
    console.log('Ignoring canvas error', e)
  } finally {
    performance.measure('determineEmojiSupportLevel', 'determineEmojiSupportLevel')
  }
  // In case of an error, be generous and just assume all emoji are supported (e.g. for canvas errors
  // due to anti-fingerprinting add-ons). Better to show some gray boxes than nothing at all.
  return {
    version: entries[0][1], // first one in the list is the most recent version
    countryFlags: true
  }
}
