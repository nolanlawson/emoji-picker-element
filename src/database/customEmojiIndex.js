import { trie } from './utils/trie'
import { extractTokens } from './utils/extractTokens'
import { assertCustomEmojis } from './utils/assertCustomEmojis'
import { findCommonMembers } from './utils/findCommonMembers'

export function customEmojiIndex (customEmojis) {
  assertCustomEmojis(customEmojis)

  const sortByName = (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1

  //
  // all()
  //
  const all = customEmojis.sort(sortByName)

  //
  // search()
  //
  const emojiToTokens = emoji => {
    const set = new Set()
    if (emoji.shortcodes) {
      for (const shortcode of emoji.shortcodes) {
        for (const token of extractTokens(shortcode)) {
          set.add(token)
        }
      }
    }
    return set
  }
  const searchTrie = trie(customEmojis, emojiToTokens)
  const searchByExactMatch = _ => searchTrie(_, true)
  const searchByPrefix = _ => searchTrie(_, false)

  // Search by query for custom emoji. Similar to how we do this in IDB, the last token
  // is treated as a prefix search, but every other one is treated as an exact match.
  // Then we AND the results together
  const search = query => {
    const tokens = extractTokens(query)
    const intermediateResults = tokens.map((token, i) => (
      (i < tokens.length - 1 ? searchByExactMatch : searchByPrefix)(token)
    ))
    return findCommonMembers(intermediateResults, _ => _.name).sort(sortByName)
  }

  //
  // byShortcode, byName
  //
  const shortcodeToEmoji = new Map()
  const nameToEmoji = new Map()
  for (const customEmoji of customEmojis) {
    nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji)
    for (const shortcode of (customEmoji.shortcodes || [])) {
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
