// list of emoticons that don't match a simple \W+ regex
// extracted using:
// require('emojibase-data/en/data.json').map(_ => _.emoticon).filter(Boolean).filter(_ => !/^\W+$/.test(_))
const irregularEmoticons = Set([
  ':D', 'xD', ":'D", 'o:)',
  ':x', ':p', ';p', 'xp',
  ':l', ':z', ':j', '8D',
  'xo', '8)', ':B', ':o',
  ':s', ":'o", 'Dx', 'x(',
  'D:', ':c', '>0)', ':3',
  '</3', '<3', '\\m/', ':E',
  '8#'
])

export function extractTokens (str) {
  return str
    .split(/[\s_]+/)
    .map(word => {
      if (!word.match(/\w/) || irregularEmoticons.has(word)) {
        // for pure emoticons like :) or :-), just leave them as-is
        return word.toLowerCase()
      }

      return word
        .replace(/[)(:,]/g, '')
        .replace(/’/g, "'")
        .toLowerCase()
    }).filter(Boolean)
}
