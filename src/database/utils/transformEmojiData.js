import { extractTokens } from './extractTokens'
import { normalizeTokens } from './normalizeTokens'
import { EMPTY_ARRAY } from '../../shared/lang.js'

// Transform emoji data for storage in IDB
export function transformEmojiData (emojiData) {
  performance.mark('transformEmojiData')
  const res = emojiData.map(({ annotation, emoticon, group, order, shortcodes, skins, tags, emoji, version }) => {
    const tokens = [...new Set(
      normalizeTokens([
        ...(shortcodes || EMPTY_ARRAY).map(extractTokens).flat(),
        ...tags.map(extractTokens).flat(),
        ...extractTokens(annotation),
        emoticon
      ])
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
  performance.measure('transformEmojiData', 'transformEmojiData')
  return res
}
