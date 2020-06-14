import { trie } from './utils/trie'
import { extractTokens } from './utils/extractTokens'
import { assertCustomEmojis } from './utils/assertCustomEmojis'
import { findCommonMembers } from './utils/findCommonMembers'

export function customEmojiIndex (customEmojis) {
  assertCustomEmojis(customEmojis)
  // sort custom emojis by name
  const all = customEmojis.sort((a, b) => a.name < b.name ? -1 : 1)

  // search query to custom emoji. Similar to how we do this in IDB, the last token
  // is treated as a prefix search, but every other one is treated as an exact match
  // Then we AND the results together
  const emojiToTokens = emoji => (
    [...new Set(emoji.shortcodes.map(shortcode => extractTokens(shortcode)).flat())]
  )
  const { byPrefix, byExactMatch } = trie(customEmojis, emojiToTokens)
  const search = query => {
    const searchTokens = extractTokens(query)
    const intermediateResults = [
      ...searchTokens.slice(0, -1).map(byExactMatch),
      byPrefix(searchTokens[searchTokens.length - 1])
    ]
    return findCommonMembers(intermediateResults, _ => _.name).sort((a, b) => a.name < b.name ? -1 : 1)
  }

  // shortcodes to custom emoji
  const shortcodeToEmoji = new Map()
  for (const customEmoji of customEmojis) {
    for (const shortcode of customEmoji.shortcodes) {
      shortcodeToEmoji.set(shortcode.toLowerCase(), customEmoji)
    }
  }
  const byShortcode = shortcode => shortcodeToEmoji.get(shortcode.toLowerCase())

  const nameToEmoji = new Map()
  for (const customEmoji of customEmojis) {
    nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji)
  }
  const byName = name => nameToEmoji.get(name.toLowerCase())
  return {
    all,
    search,
    byShortcode,
    byName
  }
}
