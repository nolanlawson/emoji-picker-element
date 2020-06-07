import { Database } from '../index.js'
import allEmoji from 'emojibase-data/en/data.json'
import frEmoji from 'emojibase-data/fr/data.json'
import {
  basicAfterEach, basicBeforeEach, ALL_EMOJI, ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG, truncatedEmoji, truncateEmoji
} from './shared'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('database tests', () => {
  test('basic emoji database test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    const emojis = await db.getEmojiBySearchQuery('face')
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

    // first time - data is v1
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

    // second time - update, data is v2
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

    // third time - no update, data is v2
    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource, () => new Response(JSON.stringify(changedEmoji), { headers: { ETag: 'W/yyy' } }))
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/yyy' } }))

    db = new Database({ dataSource })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    await db.delete()
  })

  test('updates emoji on second load if changed - no ETag', async () => {
    const dataSource = 'http://localhost/will-change.json'

    // first time - data is v1
    fetch.get(dataSource, () => new Response(JSON.stringify(truncatedEmoji)))
    fetch.head(dataSource, () => new Response(null))

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

    // second time - update, data is v2
    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource, () => new Response(JSON.stringify(changedEmoji)))
    fetch.head(dataSource, () => new Response(null))

    db = new Database({ dataSource })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)
    expect(fetch).toHaveBeenNthCalledWith(1, dataSource, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    await db.close()

    // third time - no update, data is v2
    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource, () => new Response(JSON.stringify(changedEmoji)))
    fetch.head(dataSource, () => new Response(null))

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

  test('URL change causes an update', async () => {
    const dataSource = 'http://localhost/will-change.json'
    const dataSource2 = 'http://localhost/will-change2.json'

    // first time - data is v1
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

    // second time - update, data is v2
    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource2, () => new Response(JSON.stringify(changedEmoji), { headers: { ETag: 'W/yyy' } }))
    fetch.head(dataSource2, () => new Response(null, { headers: { ETag: 'W/yyy' } }))

    db = new Database({ dataSource: dataSource2 })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(dataSource2, undefined)
    expect(fetch).toHaveBeenNthCalledWith(1, dataSource2, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    // third time - no update, data is v2
    fetch.mockClear()
    fetch.reset()
    fetch.get(dataSource2, () => new Response(JSON.stringify(changedEmoji), { headers: { ETag: 'W/yyy' } }))
    fetch.head(dataSource2, () => new Response(null, { headers: { ETag: 'W/yyy' } }))

    db = new Database({ dataSource: dataSource2 })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(dataSource2, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    await db.delete()
  })

  test('invalid emoji data', async () => {
    const NULL = 'http://localhost/null.json'
    const NOT_ARRAY = 'not-array.json'
    const EMPTY = 'empty.json'
    const NULL_ARRAY = 'null-array.json'
    const BAD_OBJECT = 'bad-object.json'
    fetch.get(NULL, () => new Response('null'))
    fetch.get(NOT_ARRAY, () => new Response('{}'))
    fetch.get(EMPTY, () => new Response('[]'))
    fetch.get(NULL_ARRAY, () => new Response('[null]'))
    fetch.get(BAD_OBJECT, () => new Response('[{"missing": true}]'))

    const makeDB = async (dataSource) => {
      const db = new Database({ dataSource })
      await db.ready()
    }

    for (const dataSource of [NULL, NOT_ARRAY, EMPTY, NULL_ARRAY, BAD_OBJECT]) {
      await expect(makeDB(dataSource)).rejects.toThrow(/data is in wrong format/)
    }
  })

  test('close twice, delete twice', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.close()
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    await db.delete()
    await db.delete()
  })

  test('multiple databases, close one', async () => {
    const db1 = new Database({ dataSource: ALL_EMOJI })
    const db2 = new Database({ dataSource: ALL_EMOJI })
    await db1.close()
    await expect(() => db1.getEmojiByGroup(1)).rejects.toThrow()
    await expect(() => db2.getEmojiByGroup(1)).rejects.toThrow()
    const db3 = new Database({ dataSource: ALL_EMOJI })
    await db3.ready()
    await new Promise(resolve => setTimeout(resolve, 50))
    await db3.delete()
  })

  test('multiple databases, delete one', async () => {
    const db1 = new Database({ dataSource: ALL_EMOJI })
    const db2 = new Database({ dataSource: ALL_EMOJI })
    await db1.delete()
    await expect(() => db1.getEmojiByGroup(1)).rejects.toThrow()
    await expect(() => db2.getEmojiByGroup(1)).rejects.toThrow()
  })

  test('multiple databases in multiple locales', async () => {
    const truncatedFrEmoji = truncateEmoji(frEmoji)
    const dataSourceFr = 'http://localhost/fr.json'

    fetch.get(dataSourceFr, () => new Response(JSON.stringify(truncatedFrEmoji), { headers: { ETag: 'W/zzz' } }))
    fetch.head(dataSourceFr, () => new Response(null, { headers: { ETag: 'W/zzz' } }))

    const en = new Database({ dataSource: ALL_EMOJI })
    const fr = new Database({ dataSource: dataSourceFr, locale: 'fr' })

    expect((await en.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual(['monkey face'])
    expect((await fr.getEmojiBySearchQuery('tête singe')).map(_ => _.annotation)).toStrictEqual(['tête de singe'])

    await en.delete()

    // deleting en has no impact on fr
    await expect(() => en.getEmojiBySearchQuery('monkey face')).rejects.toThrow()
    expect((await fr.getEmojiBySearchQuery('tête singe')).map(_ => _.annotation)).toStrictEqual(['tête de singe'])

    await en.delete()
    await fr.delete()
  })
})
