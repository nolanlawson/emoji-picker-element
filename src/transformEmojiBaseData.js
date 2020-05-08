export function transformEmojiBaseData (emojiBaseData) {
  return emojiBaseData.map(({ annotation, emoticon, group, order, shortcodes, tags, unicode }) => {
    const tokens = [].concat(shortcodes).concat(tags).map(_ => _.toLowerCase())
    const res = {
      annotation,
      group,
      order,
      shortcodes,
      tags,
      tokens,
      unicode
    }
    if (emoticon) {
      res.emoticon = emoticon
    }
    return res
  })
}
