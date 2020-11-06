import { MIN_SEARCH_TEXT_LENGTH } from '../../shared/constants'
import { mark, stop } from '../../shared/marks'
import { extractTokens } from './extractTokens'

// Transform emoji data for storage in IDB
export function transformEmojiData (emojiData) {
  mark('transformEmojiData')
  const res = emojiData.map(({ annotation, emoticon, group, order, shortcodes, skins, tags, emoji, version }) => {
    const tokens = [...new Set(
      [
        ...(shortcodes || []).map(extractTokens).flat(),
        ...tags.map(extractTokens).flat(),
        ...extractTokens(annotation),
        emoticon
      ]
        .filter(Boolean)
        .map(_ => _.toLowerCase())
        .filter(_ => _.length >= MIN_SEARCH_TEXT_LENGTH)
    )].sort()
    const res = {
      annotation,
      group,
      order,
      tags,
      tokens,
      unicode: emoji,
      version
    }
    if (emoticon) {
      res.emoticon = emoticon
    }
    if (shortcodes) {
      res.shortcodes = shortcodes
    }
    if (skins) {
      res.skinTones = []
      res.skinUnicodes = []
      res.skinVersions = []
      for (const { tone, emoji, version } of skins) {
        res.skinTones.push(tone)
        res.skinUnicodes.push(emoji)
        res.skinVersions.push(version)
      }
    }
    return res
  })
  stop('transformEmojiData')
  return res
}
