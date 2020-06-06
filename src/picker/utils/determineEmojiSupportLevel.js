// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import isEmoji from 'if-emoji'
import { mark, stop } from '../../shared/marks'

const versionsAndTestEmoji = process.env.VERSIONS_AND_TEST_EMOJI

export function determineEmojiSupportLevel () {
  mark('determineEmojiSupportLevel')
  const versionsWithSupports = Object.entries(versionsAndTestEmoji).map(([emoji, version]) => {
    const supported = isEmoji(emoji)
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
