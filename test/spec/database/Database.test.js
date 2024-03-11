import Database from '../../../src/database/Database'
import {
  basicAfterEach, basicBeforeEach, ALL_EMOJI, ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG, tick, mockFrenchDataSource, FR_EMOJI, truncatedEmoji, NO_SHORTCODES, mockDataSourceWithNoShortcodes
} from '../shared'
import trimEmojiData from '../../../src/trimEmojiData'
import { mockFetch, mockGetAndHead } from '../mockFetch.js'

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
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    await tick(5) // the HEAD request is done asynchronously, so wait for it
    expect(fetch.calls().length).toBe(2)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toEqual({ method: 'HEAD' })
    await db.delete()
  })

  test('calls GET first and tries HEAD if ETag unavailable', async () => {
    let db = new Database({ dataSource: ALL_EMOJI_NO_ETAG })
    await db.ready()
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI_NO_ETAG)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI_NO_ETAG })
    await db.ready()
    await tick(5) // the request is done asynchronously, so wait for it
    expect(fetch.calls().length).toBe(3)
    expect(fetch.calls().at(-2)[0]).toBe(ALL_EMOJI_NO_ETAG)
    expect(fetch.calls().at(-2)[1]).toEqual({ method: 'HEAD' })
    expect(fetch.lastUrl()).toBe(ALL_EMOJI_NO_ETAG)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.delete()
  })

  test('database deletion actually deletes and causes re-fetch', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.delete()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(fetch.calls().length).toBe(2)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.delete()
  })

  test('misconfigured server where ETag in GET but not HEAD still works', async () => {
    let db = new Database({ dataSource: ALL_EMOJI_MISCONFIGURED_ETAG })
    await db.ready()
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI_MISCONFIGURED_ETAG)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.close()
    db = new Database({ dataSource: ALL_EMOJI_MISCONFIGURED_ETAG })
    await db.ready()
    await tick(5) // the request is done asynchronously, so wait for it
    expect(fetch.calls().length).toBe(3)
    expect(fetch.calls().at(-2)[0]).toBe(ALL_EMOJI_MISCONFIGURED_ETAG)
    expect(fetch.calls().at(-2)[1]).toEqual({ method: 'HEAD' })
    expect(fetch.lastUrl()).toBe(ALL_EMOJI_MISCONFIGURED_ETAG)
    expect(fetch.lastOptions()).toBe(undefined)
    await db.delete()
  })

  test('invalid emoji data', async () => {
    const NULL = 'null.json'
    const NOT_ARRAY = 'not-array.json'
    const EMPTY = 'empty.json'
    const NULL_ARRAY = 'null-array.json'
    const BAD_OBJECT = 'bad-object.json'
    mockFetch('get', NULL, 'null')
    mockFetch('get', NOT_ARRAY, '{}')
    mockFetch('get', EMPTY, '[]')
    mockFetch('get', NULL_ARRAY, '[null]')
    mockFetch('get', BAD_OBJECT, '[{"missing": true}]')

    const makeDB = async (dataSource) => {
      const db = new Database({ dataSource })
      await db.ready()
    }

    for (const dataSource of [NULL, NOT_ARRAY, EMPTY, NULL_ARRAY, BAD_OBJECT]) {
      await expect(makeDB(dataSource)).rejects.toThrow('Emoji data is in the wrong format')
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
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.close()
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('simultaneous closes', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await Promise.all([db.close(), db.close()])
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('simultaneous close and delete', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await Promise.all([db.close(), db.delete()])
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('delete and then use afterwards should work okay', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.delete()
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.delete()
  })

  test('multiple databases on same source, close both', async () => {
    const db1 = new Database({ dataSource: ALL_EMOJI })
    await db1.ready()
    const db2 = new Database({ dataSource: ALL_EMOJI })
    await db2.ready()
    await db2._lazyUpdate // TODO [#407] Skipping this causes an InvalidStateError in IDB
    await db1.close()
    expect((await db1.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db2.close()
    expect((await db2.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
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
    const queryPromise = db2.getEmojiByUnicodeOrName('🐵')
    const closePromise = db1.close()
    expect(await queryPromise)
    await closePromise
    await db1.delete()
  })

  test('basic trimEmojiData test', async () => {
    const trimmed = trimEmojiData(truncatedEmoji)
    const dataSource = 'trimmed.js'
    mockGetAndHead(dataSource, trimmed, { headers: { ETag: 'W/trim' } })

    const db = new Database({ dataSource })
    const emojis = await db.getEmojiBySearchQuery('face')
    expect(emojis.length).toBe(28)
    const thumbsUp = await db.getEmojiBySearchQuery('+1')
    expect(thumbsUp[0].skins).toHaveLength(5)
    expect(thumbsUp[0].skins[0].tone).toBeTruthy()
    expect(thumbsUp[0].skins[0].unicode).toBeTruthy()
    expect(thumbsUp[0].skins[0].version).toBeTruthy()
    expect(thumbsUp[0].shortcodes).toContain('thumbsup')
    const grinningFace = await db.getEmojiBySearchQuery('grinning face with smiling eyes')
    expect(grinningFace[0].emoticon).toEqual(':D')
    await db.delete()
  })

  test('close a second database, first database should still work', async () => {
    const dataSource = ALL_EMOJI
    const db1 = new Database({ dataSource })
    await db1.ready()

    const db2 = new Database({ dataSource })
    await db2.ready()
    await db2._lazyUpdate

    await db1.close()

    expect((await db2.getEmojiByUnicodeOrName('🐵')).unicode).toBe('🐵')

    await db1.delete()
    await db2.delete()

    await tick(20)
  })

  test('delete a second database, first database should still work', async () => {
    const dataSource = ALL_EMOJI
    const db1 = new Database({ dataSource })
    await db1.ready()

    const db2 = new Database({ dataSource })
    await db2.ready()
    await db2._lazyUpdate

    await db1.delete()

    expect((await db2.getEmojiByUnicodeOrName('🐵')).unicode).toBe('🐵')

    await db1.delete()
    await db2.delete()

    await tick(20)
  })

  test('close in db2 after deletion in db1', async () => {
    const dataSource = ALL_EMOJI
    const db = new Database({ dataSource })
    const db2 = new Database({ dataSource })
    await Promise.all([db.delete(), db2.close()])
    await tick(40)
  })

  test('delete in db2 after deletion in db1', async () => {
    const dataSource = ALL_EMOJI
    const db = new Database({ dataSource })
    const db2 = new Database({ dataSource })
    await Promise.all([db.delete(), db2.delete()])
    await tick(40)
  })

  test('emoji with no shortcodes still work', async () => {
    const dataSource = NO_SHORTCODES
    mockDataSourceWithNoShortcodes()

    const db = new Database({ dataSource })
    await db.ready()

    expect((await db.getEmojiBySearchQuery('monkey'))[0].unicode).toBe('🐵')

    await db.delete()
  })
})
