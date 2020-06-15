import { trie } from './utils/trie'
import { extractTokens } from './utils/extractTokens'
import { assertCustomEmojis } from './utils/assertCustomEmojis'
import { findCommonMembers } from './utils/findCommonMembers'

export function customEmojiIndex (customEmojis) {
  assertCustomEmojis(customEmojis)

  //
  // all()
  //
  const all = customEmojis.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)

  //
  // search()
  //
  const emojiToTokens = emoji => (
    [...new Set(emoji.shortcodes.map(shortcode => extractTokens(shortcode)).flat())]
  )
  const searchTrie = trie(customEmojis, emojiToTokens)
  const searchByExactMatch = _ => searchTrie(_, true)
  const searchByPrefix = _ => searchTrie(_, false)

  // Search by query for custom emoji. Similar to how we do this in IDB, the last token
  // is treated as a prefix search, but every other one is treated as an exact match.
  // Then we AND the results together
  const search = query => {
    const searchTokens = extractTokens(query)
    const intermediateResults = [
      ...searchTokens.slice(0, -1).map(searchByExactMatch),
      searchByPrefix(searchTokens[searchTokens.length - 1])
    ]
    return findCommonMembers(intermediateResults, _ => _.name)
      .sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)
  }

  //
  // byShortcode, byName
  //
  const shortcodeToEmoji = new Map()
  const nameToEmoji = new Map()
  for (const customEmoji of customEmojis) {
    nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji)
    for (const shortcode of customEmoji.shortcodes) {
      shortcodeToEmoji.set(shortcode.toLowerCase(), customEmoji)
    }
  }

  const byShortcode = shortcode => shortcodeToEmoji.get(shortcode.toLowerCase())
  const byName = name => nameToEmoji.get(name.toLowerCase())

  return {
    all,
    search,
    byShortcode,
    byName
  }
}
