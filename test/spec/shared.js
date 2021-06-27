import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import frEmoji from 'emoji-picker-element-data/fr/cldr/data.json'
import allEmojibaseV5Emoji from 'emojibase-data/en/data.json'
import { DEFAULT_DATA_SOURCE } from '../../src/database/constants'

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
const emojibaseV5Emoji = truncateEmoji(allEmojibaseV5Emoji)

export const ALL_EMOJI = 'http://localhost/emoji.json'
export const ALL_EMOJI_NO_ETAG = 'http://localhost/emoji-no-etag.json'
export const ALL_EMOJI_MISCONFIGURED_ETAG = 'http://localhost/emoji-misconfigured-etag.json'
export const FR_EMOJI = 'http://localhost/fr.json'
export const NO_SHORTCODES = 'http://localhost/no-shortcodes'
export const EMOJIBASE_V5 = 'http://localhost/emojibase'
export const WITH_ARRAY_SKIN_TONES = 'http://localhost/with-array-skin-tones'

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

export function mockDefaultDataSource () {
  fetch.get(DEFAULT_DATA_SOURCE, () => new Response(JSON.stringify(truncatedEmoji), { headers: { ETag: 'W/def' } }))
  fetch.head(DEFAULT_DATA_SOURCE, () => new Response(null, { headers: { ETag: 'W/def' } }))
}

export function mockFrenchDataSource () {
  fetch.get(FR_EMOJI, () => new Response(JSON.stringify(truncatedFrEmoji), { headers: { ETag: 'W/zzz' } }))
  fetch.head(FR_EMOJI, () => new Response(null, { headers: { ETag: 'W/zzz' } }))
}

export function mockDataSourceWithNoShortcodes () {
  const noShortcodeEmoji = truncatedEmoji.map(emoji => {
    const res = JSON.parse(JSON.stringify(emoji))
    delete res.shortcodes
    return res
  })
  fetch.get(NO_SHORTCODES, () => new Response(JSON.stringify(noShortcodeEmoji), { headers: { ETag: 'W/noshort' } }))
  fetch.head(NO_SHORTCODES, () => new Response(null, { headers: { ETag: 'W/noshort' } }))
}

export function mockEmojibaseV5DataSource () {
  fetch.get(EMOJIBASE_V5, () => new Response(JSON.stringify(emojibaseV5Emoji), { headers: { ETag: 'W/emojibase' } }))
  fetch.head(EMOJIBASE_V5, () => new Response(null, { headers: { ETag: 'W/emojibase' } }))
}

export function mockDataSourceWithArraySkinTones () {
  const emojis = JSON.parse(JSON.stringify(truncatedEmoji))
  emojis.push(allEmoji.find(_ => _.annotation === 'people holding hands')) // has two skin tones, one for each person

  fetch
    .get(WITH_ARRAY_SKIN_TONES, () => (
      new Response(JSON.stringify(emojis), { headers: { ETag: 'W/noshort' } }))
    )
    .head(WITH_ARRAY_SKIN_TONES, () => new Response(null, { headers: { ETag: 'W/noshort' } }))
}
