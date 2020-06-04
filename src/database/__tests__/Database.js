import Database from '../Database'
import allEmoji from 'emojibase-data/en/data.json'

function truncateEmoji (allEmoji) {
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

const truncatedEmoji = truncateEmoji(allEmoji)

const ALL_EMOJI = 'http://localhost/emoji.json'
const ALL_EMOJI_NO_ETAG = 'http://localhost/emoji-no-etag.json'

beforeEach(() => {
  fetch
    .get(ALL_EMOJI, () => {
      const resp = new fetch.Response(JSON.stringify(truncatedEmoji))
      resp.headers.set('ETag', 'W/xxx')
      resp.headers.set('Content-Type', 'application/json')
      return resp
    })
    .head(ALL_EMOJI, () => {
      const resp = new fetch.Response()
      resp.headers.set('ETag', 'W/xxx')
      return resp
    })
    .get(ALL_EMOJI_NO_ETAG, truncatedEmoji)
})

afterEach(() => {
  fetch.mockClear()
  fetch.reset()
})

describe('fetch tests', () => {
  test('make sure fetch-mock-jest is working correctly', async () => {
    expect(fetch).toHaveBeenCalledTimes(0)
    const resp = await fetch(ALL_EMOJI)
    expect(resp.headers.get('etag')).toBe('W/xxx')
    expect(await (resp).json()).toStrictEqual(truncatedEmoji)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
  })

  test('make sure fetch-mock-jest is working correctly 2', async () => {
    expect(fetch).toHaveBeenCalledTimes(0)
    const resp = await fetch(ALL_EMOJI_NO_ETAG)
    expect(resp.headers.get('etag')).toBeFalsy()
    expect(await (resp).json()).toStrictEqual(truncatedEmoji)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_NO_ETAG, undefined)
  })

  test('make sure fetch-mock-jest is working correctly 3', async () => {
    expect(fetch).toHaveBeenCalledTimes(0)
    const resp = await fetch(ALL_EMOJI, { method: 'HEAD' })
    expect(resp.headers.get('etag')).toBe('W/xxx')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, { method: 'HEAD' })
  })
})

describe('database tests', () => {
  test('basic emoji database test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    const emojis = await db.getEmojiBySearchPrefix('face')
    expect(emojis.length).toBe(28)
    await db.delete()
  })

  test('calls GET first and HEAD afterwards', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50)) // the HEAD request is done asynchronously, so wait for it
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, { method: 'HEAD' })
    await db.delete()
  })
})
