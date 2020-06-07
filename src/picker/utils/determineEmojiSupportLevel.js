// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import isEmoji from 'if-emoji'
import { mark, stop } from '../../shared/marks'
import { isJest } from './isJest'

const versionsAndTestEmoji = process.env.VERSIONS_AND_TEST_EMOJI

export function determineEmojiSupportLevel () {
  mark('determineEmojiSupportLevel')
  const testEmoji = isJest() ? () => true : isEmoji // avoid using Canvas in Jest, just say we support all emoji
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
