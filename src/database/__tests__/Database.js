import Database from '../Database'
import allEmoji from 'emojibase-data/en/data.json'

const { Response } = fetch

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
const ALL_EMOJI_MISCONFIGURED_ETAG = 'http://localhost/emoji-misconfigured-etag.json'

beforeEach(() => {
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
    await new Promise(resolve => setTimeout(resolve)) // the HEAD request is done asynchronously, so wait for it
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, { method: 'HEAD' })
    await db.delete()
  })

  test('calls GET first and tries HEAD if ETag unavailable', async () => {
    let db = new Database({ dataSource: ALL_EMOJI_NO_ETAG })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_NO_ETAG, undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI_NO_ETAG })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve)) // the request is done asynchronously, so wait for it
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(2, ALL_EMOJI_NO_ETAG, { method: 'HEAD' })
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_NO_ETAG, undefined)
    await db.delete()
  })

  test('database deletion actually deletes and causes re-fetch', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
    await db.delete()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
    await db.delete()
  })

  test('misconfigured server where ETag in GET but not HEAD still works', async () => {
    let db = new Database({ dataSource: ALL_EMOJI_MISCONFIGURED_ETAG })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_MISCONFIGURED_ETAG, undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI_MISCONFIGURED_ETAG })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve)) // the request is done asynchronously, so wait for it
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(2, ALL_EMOJI_MISCONFIGURED_ETAG, { method: 'HEAD' })
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_MISCONFIGURED_ETAG, undefined)
    await db.delete()
  })

  test('updates emoji on second load if changed', async () => {
    const dataSource = 'http://localhost/will-change.json'
    fetch.get(dataSource, () => new Response(JSON.stringify(truncatedEmoji), { headers: { ETag: 'W/xxx' } }))
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/xxx' } }))

    let db = new Database({ dataSource })
    await db.ready()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)

    expect((await db.getEmojiByShortcode('rofl')).annotation).toBe('rolling on the floor laughing')
    expect(await db.getEmojiByShortcode('weary_cat')).toBeFalsy()

    await db.close()

    const changedEmoji = JSON.parse(JSON.stringify(truncatedEmoji))
    const roflIndex = allEmoji.findIndex(_ => _.annotation === 'rolling on the floor laughing')
    changedEmoji[roflIndex] = allEmoji.find(_ => _.annotation === 'pineapple') // replace rofl

    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource, () => new Response(JSON.stringify(changedEmoji), { headers: { ETag: 'W/yyy' } }))
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/yyy' } }))

    db = new Database({ dataSource })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)
    expect(fetch).toHaveBeenNthCalledWith(1, dataSource, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    await db.delete()
  })

  // test - same test but no ETag
  // test - invalid data
  // test - URL changed
  // test - are shortcodes unique?
})
