// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import isEmoji from 'if-emoji/src/index.js'
import { mark, stop } from '../../shared/marks'

// In production mode, preprocess the file so we don't have to run a bunch of logic and can
// just directly inject the JSON object itself. In Jest, this is a JSON string.
const versionsAndTestEmoji = process.env.NODE_ENV === 'test'
  ? JSON.parse(process.env.VERSIONS_AND_TEST_EMOJI)
  : process.env.VERSIONS_AND_TEST_EMOJI

export function determineEmojiSupportLevel () {
  mark('determineEmojiSupportLevel')
  const testEmoji = process.env.NODE_ENV === 'test'
    ? () => Math.max(...Object.values(versionsAndTestEmoji))
    : isEmoji // avoid using Canvas in Jest, just say we support all emoji
  const versionsWithSupports = Object.entries(versionsAndTestEmoji).map(([emoji, version]) => {
    const supported = testEmoji(emoji)
    return {
      version,
      supported
    }
  })
  const res = versionsWithSupports
    .filter(_ => _.supported)
    .map(_ => _.version)
    .sort((a, b) => a < b ? 1 : -1)[0]
  stop('determineEmojiSupportLevel')
  return res
}
