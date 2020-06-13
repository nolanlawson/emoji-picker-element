import Database from '../../../src/database/Database'
import {
  basicAfterEach, basicBeforeEach, ALL_EMOJI, ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG, tick, mockFrenchDataSource, FR_EMOJI
} from '../shared'

describe('database tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

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
    await tick(5) // the HEAD request is done asynchronously, so wait for it
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
    await tick(5) // the request is done asynchronously, so wait for it
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
    await tick(5) // the request is done asynchronously, so wait for it
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(2, ALL_EMOJI_MISCONFIGURED_ETAG, { method: 'HEAD' })
    expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI_MISCONFIGURED_ETAG, undefined)
    await db.delete()
  })

  test('invalid emoji data', async () => {
    const NULL = 'null.json'
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
    await db.delete()
    await db.delete()
  })

  test('close and then use afterwards should work okay', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.close()
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('simultaneous closes', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await Promise.all([db.close(), db.close()])
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('simultaneous close and delete', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await Promise.all([db.close(), db.delete()])
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('delete and then use afterwards should work okay', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.delete()
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('multiple databases on same source, close both', async () => {
    const db1 = new Database({ dataSource: ALL_EMOJI })
    await db1.ready()
    const db2 = new Database({ dataSource: ALL_EMOJI })
    await db2.ready()
    await db1.close()
    expect((await db1.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db2.close()
    expect((await db2.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    const db3 = new Database({ dataSource: ALL_EMOJI })
    await db3.ready()
    await db3.delete()
  })

  test('multiple databases in multiple locales', async () => {
    mockFrenchDataSource()

    const en = new Database({ dataSource: ALL_EMOJI })
    const fr = new Database({ dataSource: FR_EMOJI, locale: 'fr' })

    expect((await en.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual(['monkey face'])
    expect((await fr.getEmojiBySearchQuery('tête singe')).map(_ => _.annotation)).toStrictEqual(['tête de singe'])

    await en.delete()

    // deleting en has no impact on fr
    expect((await fr.getEmojiBySearchQuery('tête singe')).map(_ => _.annotation)).toStrictEqual(['tête de singe'])

    await en.delete()
    await fr.delete()
  })

  test('no error if you query one DB while closing another', async () => {
    const db1 = new Database({ dataSource: ALL_EMOJI })
    await db1.ready()
    const db2 = new Database({ dataSource: ALL_EMOJI })
    await db2.ready()
    await db2._lazyUpdate
    const queryPromise = db2.getEmojiByUnicode('🐵')
    const closePromise = db1.close()
    expect(await queryPromise)
    await closePromise
    await db1.delete()
  })
})
