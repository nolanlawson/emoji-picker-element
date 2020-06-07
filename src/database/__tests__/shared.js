import allEmoji from 'emojibase-data/en/data.json'

const { Response } = fetch

export function truncateEmoji (allEmoji) {
  // just take the first few emoji from each category, or else it takes forever to insert
  // into fake-indexeddb: https://github.com/dumbmatter/fakeIndexedDB/issues/44
  const groupsToEmojis = new Map()
  for (const emoji of allEmoji) {
    let emojis = groupsToEmojis.get(emoji.group)
    if (!emojis) {
      emojis = []
      groupsToEmojis.set(emoji.group, emojis)
    }
    if (emojis.length < 20) {
      emojis.push(emoji)
    }
  }
  return [...groupsToEmojis.values()].flat()
}

export const truncatedEmoji = truncateEmoji(allEmoji)

export const ALL_EMOJI = 'http://localhost/emoji.json'
export const ALL_EMOJI_NO_ETAG = 'http://localhost/emoji-no-etag.json'
export const ALL_EMOJI_MISCONFIGURED_ETAG = 'http://localhost/emoji-misconfigured-etag.json'

export function basicBeforeEach () {
  fetch
    .get(ALL_EMOJI, () => new Response(JSON.stringify(truncatedEmoji), {
      headers: { ETag: 'W/xxx' }
    }))
    .head(ALL_EMOJI, () => new Response(null, {
      headers: { ETag: 'W/xxx' }
    }))
    .get(ALL_EMOJI_NO_ETAG, truncatedEmoji)
    .head(ALL_EMOJI_NO_ETAG, () => new Response(null))
    .get(ALL_EMOJI_MISCONFIGURED_ETAG, () => new Response(JSON.stringify(truncatedEmoji), {
      headers: { ETag: 'W/xxx' }
    }))
    .head(ALL_EMOJI_MISCONFIGURED_ETAG, () => new Response(null))
}

export function basicAfterEach () {
  fetch.mockClear()
  fetch.reset()
}
