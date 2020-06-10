import { MIN_SEARCH_TEXT_LENGTH } from '../../shared/constants'
import { mark, stop } from '../../shared/marks'
import { extractTokens } from './extractTokens'

export function transformEmojiBaseData (emojiBaseData) {
  mark('transformEmojiBaseData')
  const res = emojiBaseData.map(({ annotation, emoticon, group, order, shortcodes, skins, tags, emoji, version }) => {
    const tokens = [...new Set(
      [
        ...shortcodes.map(extractTokens).flat(),
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
      shortcodes,
      tags,
      tokens,
      unicode: emoji,
      version
    }
    if (emoticon) {
      res.emoticon = emoticon
    }
    if (skins) {
      res.skins = skins.map(({ tone, emoji, version }) => ({ tone, unicode: emoji, version }))
    }
    return res
  })
  stop('transformEmojiBaseData')
  return res
}
