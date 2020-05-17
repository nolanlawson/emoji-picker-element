export function transformEmojiBaseData (emojiBaseData) {
  return emojiBaseData.map(({ annotation, emoticon, group, order, shortcodes, tags, emoji, version }) => {
    const tokens = [...new Set(
      [
        ...shortcodes.map(shortcode => shortcode.split('_')).flat(),
        ...tags,
        ...annotation.split(/\s+/),
        emoticon
      ].filter(Boolean)
        .map(_ => _.toLowerCase())
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
    return res
  })
}
