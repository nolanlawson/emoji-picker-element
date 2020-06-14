import { trie } from './utils/trie'
import { extractTokens } from './utils/extractTokens'
import { assertCustomEmojis } from './utils/assertCustomEmojis'

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
    const shortestArray = intermediateResults.sort((a, b) => (a.length < b.length ? -1 : 1))[0]
    const results = []
    for (const item of shortestArray) {
      // if this item is included in every array in the intermediate results, add it to the final results
      if (!intermediateResults.some(array => array.findIndex(_ => _.shortcode === item.shortcode) === -1)) {
        results.push(item)
      }
    }
    return results.sort((a, b) => a.shortcode < b.shortcode ? -1 : 1)
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
