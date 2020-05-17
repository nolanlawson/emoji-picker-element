// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports
import isEmoji from 'if-emoji'

const versionsAndTestEmoji = process.env.VERSIONS_AND_TEST_EMOJI

export function determineEmojiSupportLevel () {
  const versionsWithSupports = versionsAndTestEmoji.map(({ version, emoji }) => {
    const supported = isEmoji(emoji)
    return {
      version,
      supported
    }
  })
  console.log("versionsWithSupports", versionsWithSupports)
  return versionsWithSupports.filter(_ => _.supported).map(_ => _.version).sort((a, b) => a < b ? 1 : -1)[0]
}