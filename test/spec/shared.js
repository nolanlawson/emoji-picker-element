import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import frEmoji from 'emoji-picker-element-data/fr/cldr/data.json'
import allEmojibaseV5Emoji from 'emojibase-data/en/data.json'
import { DEFAULT_DATA_SOURCE } from '../../src/database/constants'
import { mockFetch, mockGetAndHead } from './mockFetch.js'

export function truncateEmoji (allEmoji) {
  // just take the first few emoji from each category, or else it takes forever to insert
  // into fake-indexeddb: https://github.com/dumbmatter/fakeIndexedDB/issues/44
  const groupsToEmojis = new Map()
  for (const emoji of allEmoji) {
    if (emoji.version >= 14) {
      continue // skip newer emoji so I don't have to change the tests every time there's an update
    }
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
  mockGetAndHead(ALL_EMOJI, truncatedEmoji, { headers: { ETag: 'W/xxx' } })
  mockGetAndHead(ALL_EMOJI_NO_ETAG, truncatedEmoji)
  mockGetAndHead(DEFAULT_DATA_SOURCE, truncatedEmoji, { headers: { ETag: 'W/def' } })
  mockFetch('get', ALL_EMOJI_MISCONFIGURED_ETAG, truncatedEmoji, { headers: { ETag: 'W/xxx' } })
  mockFetch('head', ALL_EMOJI_MISCONFIGURED_ETAG, null)
}

export async function basicAfterEach () {
  fetch.reset()
  await tick(20)
}

export async function tick (times = 1) {
  for (let i = 0; i < times; i++) {
    await new Promise(resolve => setTimeout(resolve))
  }
}

export function mockFrenchDataSource () {
  mockGetAndHead(FR_EMOJI, truncatedFrEmoji, { headers: { ETag: 'W/zzz' } })
}

export function mockDataSourceWithNoShortcodes () {
  const noShortcodeEmoji = truncatedEmoji.map(emoji => {
    const res = JSON.parse(JSON.stringify(emoji))
    delete res.shortcodes
    return res
  })
  mockGetAndHead(NO_SHORTCODES, noShortcodeEmoji, { headers: { ETag: 'W/noshort' } })
}

export function mockEmojibaseV5DataSource () {
  mockGetAndHead(EMOJIBASE_V5, emojibaseV5Emoji, { headers: { ETag: 'W/emojibase' } })
}

export function mockDataSourceWithArraySkinTones () {
  const emojis = JSON.parse(JSON.stringify(truncatedEmoji))
  emojis.push(allEmoji.find(_ => _.annotation === 'people holding hands')) // has two skin tones, one for each person

  mockGetAndHead(WITH_ARRAY_SKIN_TONES, emojis, { headers: { ETag: 'W/noshort' } })
}
