import { ALL_EMOJI, ALL_EMOJI_NO_ETAG, basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'
import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import { mockGetAndHead } from '../mockFetch.js'

function mockEmoji (dataSource, data, etag) {
  fetch.reset()
  mockGetAndHead(dataSource, data, etag && { headers: { ETag: etag } })
}

async function testDataChange (firstData, secondData, firstCallback, secondCallback, thirdCallback) {
  const dataSource = 'http://localhost/will-change.json'

  // first time - data is v1
  mockEmoji(dataSource, firstData, 'v1')

  let db = new Database({ dataSource })
  await db.ready()
  await firstCallback(db, dataSource)
  await db.close()

  // second time - update, data is v2
  mockEmoji(dataSource, secondData, 'v2')

  db = new Database({ dataSource })
  await db.ready()
  await db._lazyUpdate
  await secondCallback(db, dataSource)
  await db.close()

  // third time - no update, data is v2
  mockEmoji(dataSource, secondData, 'v2')

  db = new Database({ dataSource })
  await db.ready()
  await db._lazyUpdate

  await thirdCallback(db, dataSource)
  await db.delete()
}

describe('database second load and update', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('updates emoji on second load if changed', async () => {
    const changedEmoji = JSON.parse(JSON.stringify(truncatedEmoji))
    const roflIndex = allEmoji.findIndex(_ => _.annotation === 'rolling on the floor laughing')
    changedEmoji[roflIndex] = allEmoji.find(_ => _.annotation === 'pineapple') // replace rofl

    await testDataChange(truncatedEmoji, changedEmoji, async (db, dataSource) => {
      // first load
      expect(fetch.calls().length).toBe(1)
      expect(fetch.lastUrl()).toBe(dataSource)
      expect(fetch.lastOptions().method).toBe(undefined)
      expect((await db.getEmojiByShortcode('rofl')).annotation).toBe('rolling on the floor laughing')
      expect(await db.getEmojiByShortcode('weary_cat')).toBeFalsy()
    }, async (db, dataSource) => {
      // second load
      expect(fetch.calls().length).toBe(2)
      expect(fetch.lastUrl()).toBe(dataSource)
      expect(fetch.lastOptions().method).toBe(undefined)
      expect(fetch.calls().at(-2)[0]).toBe(dataSource)
      expect(fetch.calls().at(-2)[1].method).toBe('HEAD')
      expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
      expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    }, async (db, dataSource) => {
      // third load
      expect(fetch.calls().length).toBe(1)
      expect(fetch.lastUrl()).toBe(dataSource)
      expect(fetch.lastOptions().method).toBe('HEAD')
      expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
      expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    })
  })

  test('updates with deleted emoji', async () => {
    const noMonkey = JSON.parse(JSON.stringify(truncatedEmoji))
    const idx = noMonkey.findIndex(_ => _.annotation === 'monkey face')
    noMonkey.splice(idx, 1) // remove monkey face

    await testDataChange(truncatedEmoji, noMonkey, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([
        'monkey face'
      ])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([])
    })
  })

  test('updates with added emoji', async () => {
    const noMonkey = JSON.parse(JSON.stringify(truncatedEmoji))
    const idx = noMonkey.findIndex(_ => _.annotation === 'monkey face')
    noMonkey.splice(idx, 1) // remove monkey face

    await testDataChange(noMonkey, truncatedEmoji, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([
        'monkey face'
      ])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.annotation)).toStrictEqual([
        'monkey face'
      ])
    })
  })

  test('updates with modified emoji', async () => {
    const changedMonkey = JSON.parse(JSON.stringify(truncatedEmoji))
    const idx = changedMonkey.findIndex(_ => _.annotation === 'monkey face')
    changedMonkey[idx].shortcodes.push('fake_monkey_shortcode')

    await testDataChange(truncatedEmoji, changedMonkey, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.shortcodes)).toStrictEqual([
        ['monkey_face']
      ])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.shortcodes)).toStrictEqual([
        ['monkey_face', 'fake_monkey_shortcode']
      ])
    }, async (db) => {
      expect((await db.getEmojiBySearchQuery('monkey face')).map(_ => _.shortcodes)).toStrictEqual([
        ['monkey_face', 'fake_monkey_shortcode']
      ])
    })
  })

  test('updates emoji on second load if changed - no ETag', async () => {
    const dataSource = 'http://localhost/will-change.json'

    // first time - data is v1
    mockEmoji(dataSource, truncatedEmoji)

    let db = new Database({ dataSource })
    await db.ready()
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(dataSource)
    expect(fetch.lastOptions().method).toBe(undefined)

    expect((await db.getEmojiByShortcode('rofl')).annotation).toBe('rolling on the floor laughing')
    expect(await db.getEmojiByShortcode('weary_cat')).toBeFalsy()

    await db.close()

    const changedEmoji = JSON.parse(JSON.stringify(truncatedEmoji))
    const roflIndex = allEmoji.findIndex(_ => _.annotation === 'rolling on the floor laughing')
    changedEmoji[roflIndex] = allEmoji.find(_ => _.annotation === 'pineapple') // replace rofl

    // second time - update, data is v2
    mockEmoji(dataSource, changedEmoji)

    db = new Database({ dataSource })
    await db.ready()
    await db._lazyUpdate
    expect(fetch.calls().length).toBe(2)
    expect(fetch.lastUrl()).toBe(dataSource)
    expect(fetch.lastOptions().method).toBe(undefined)
    expect(fetch.calls().at(-2)[0]).toBe(dataSource)
    expect(fetch.calls().at(-2)[1].method).toBe('HEAD')
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    await db.close()

    // third time - no update, data is v2
    mockEmoji(dataSource, changedEmoji)

    db = new Database({ dataSource })
    await db.ready()
    await db._lazyUpdate
    expect(fetch.calls().length).toBe(2)
    expect(fetch.lastUrl()).toBe(dataSource)
    expect(fetch.lastOptions().method).toBe(undefined)
    expect(fetch.calls().at(-2)[0]).toBe(dataSource)
    expect(fetch.calls().at(-2)[1].method).toBe('HEAD')
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    await db.delete()
  })

  test('URL change causes an update', async () => {
    const dataSource = 'http://localhost/will-change.json'
    const dataSource2 = 'http://localhost/will-change2.json'

    // first time - data is v1
    mockGetAndHead(dataSource, truncatedEmoji, { headers: { ETag: 'W/xxx' } })

    let db = new Database({ dataSource })
    await db.ready()
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(dataSource)
    expect(fetch.lastOptions().method).toBe(undefined)

    expect((await db.getEmojiByShortcode('rofl')).annotation).toBe('rolling on the floor laughing')
    expect(await db.getEmojiByShortcode('weary_cat')).toBeFalsy()

    await db.close()

    const changedEmoji = JSON.parse(JSON.stringify(truncatedEmoji))
    const roflIndex = allEmoji.findIndex(_ => _.annotation === 'rolling on the floor laughing')
    changedEmoji[roflIndex] = allEmoji.find(_ => _.annotation === 'pineapple') // replace rofl

    // second time - update, data is v2
    fetch.reset()
    mockGetAndHead(dataSource2, changedEmoji, { headers: { ETag: 'W/yyy' } })

    db = new Database({ dataSource: dataSource2 })
    await db.ready()
    await db._lazyUpdate
    expect(fetch.calls().length).toBe(2)
    expect(fetch.lastUrl()).toBe(dataSource2)
    expect(fetch.lastOptions().method).toBe(undefined)
    expect(fetch.calls().at(-2)[0]).toBe(dataSource2)
    expect(fetch.calls().at(-2)[1].method).toBe('HEAD')
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    // third time - no update, data is v2
    fetch.reset()
    mockGetAndHead(dataSource2, changedEmoji, { headers: { ETag: 'W/yyy' } })

    db = new Database({ dataSource: dataSource2 })
    await db.ready()
    await db._lazyUpdate
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(dataSource2)
    expect(fetch.lastOptions().method).toBe('HEAD')
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    await db.delete()
  })

  test('URL changed but ETag did not should still cause it to re-populate', async () => {
    const otherSource = 'http://localhost/other.json'

    let db = new Database({ dataSource: ALL_EMOJI_NO_ETAG })
    await db.close()
    mockEmoji(otherSource, truncatedEmoji, 'W/xxx')

    await tick(40)
    expect(fetch.calls().length).toBe(0)

    db = new Database({ dataSource: otherSource })
    await db.ready()
    await tick(40) // the request is done asynchronously, so wait for it
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(otherSource)
    expect(fetch.lastOptions().method).toBe(undefined)
    await db.delete()
  })

  test('ETag changed, database updates happen concurrently', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    await db.close()

    const changedEmoji = JSON.parse(JSON.stringify(truncatedEmoji))
    const roflIndex = allEmoji.findIndex(_ => _.annotation === 'rolling on the floor laughing')
    changedEmoji[roflIndex] = allEmoji.find(_ => _.annotation === 'pineapple') // replace rofl

    // second time - update, data is v2
    fetch.reset()
    mockGetAndHead(ALL_EMOJI, changedEmoji, { headers: { ETag: 'W/yyy' } })

    // open two at once
    const dbs = [
      new Database({ dataSource: ALL_EMOJI }),
      new Database({ dataSource: ALL_EMOJI })
    ]

    for (const otherDB of dbs) {
      await otherDB.ready()
      await otherDB._lazyUpdate
      expect((await otherDB.getEmojiByShortcode('rofl'))).toBeFalsy()
      expect((await otherDB.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    }

    await db.delete()
  })
})
