import { trie } from './utils/trie'
import { extractTokens } from './utils/extractTokens'
import { assertCustomEmojis } from './utils/assertCustomEmojis'
import { findCommonMembers } from './utils/findCommonMembers'

export function customEmojiIndex (customEmojis) {
  assertCustomEmojis(customEmojis)
  // sort custom emojis by shortcode
  const all = customEmojis.sort((a, b) => a.shortcode.toLowerCase() < b.shortcode.toLowerCase() ? -1 : 1)

  // search query to custom emoji. Similar to how we do this in IDB, the last token
  // is treated as a prefix search, but every other one is treated as an exact match
  // Then we AND the results together
  const { byPrefix, byExactMatch } = trie(customEmojis, emoji => extractTokens(emoji.shortcode))
  const search = query => {
    const searchTokens = extractTokens(query)
    const intermediateResults = [
      ...searchTokens.slice(0, -1).map(byExactMatch),
      byPrefix(searchTokens[searchTokens.length - 1])
    ]
    return findCommonMembers(intermediateResults, _ => _.shortcode).sort((a, b) => a.shortcode < b.shortcode ? -1 : 1)
  }

  // shortcodes to custom emoji
  const shortcodeToEmoji = new Map()
  for (const customEmoji of customEmojis) {
    shortcodeToEmoji.set(customEmoji.shortcode.toLowerCase(), customEmoji)
  }
  const byShortcode = shortcode => shortcodeToEmoji.get(shortcode.toLowerCase())
  return {
    all,
    search,
    byShortcode
  }
}
