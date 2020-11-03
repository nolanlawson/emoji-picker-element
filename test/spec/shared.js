import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import frEmoji from 'emoji-picker-element-data/fr/cldr/data.json'

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
const truncatedFrEmoji = truncateEmoji(frEmoji)

export const ALL_EMOJI = 'http://localhost/emoji.json'
export const ALL_EMOJI_NO_ETAG = 'http://localhost/emoji-no-etag.json'
export const ALL_EMOJI_MISCONFIGURED_ETAG = 'http://localhost/emoji-misconfigured-etag.json'
export const FR_EMOJI = 'http://localhost/fr.json'

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

export async function tick (times = 1) {
  for (let i = 0; i < times; i++) {
    await new Promise(resolve => setTimeout(resolve))
  }
}

export function mockFrenchDataSource () {
  fetch.get(FR_EMOJI, () => new Response(JSON.stringify(truncatedFrEmoji), { headers: { ETag: 'W/zzz' } }))
  fetch.head(FR_EMOJI, () => new Response(null, { headers: { ETag: 'W/zzz' } }))
}
