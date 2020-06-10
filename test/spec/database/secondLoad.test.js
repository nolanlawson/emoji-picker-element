import { basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import { Database } from '../../../index'
import allEmoji from 'emojibase-data/en/data.json'

function mockEmoji (dataSource, data, etag) {
  fetch.mockClear()
  fetch.reset()
  fetch.get(dataSource, () => new Response(JSON.stringify(data), etag && { headers: { ETag: etag } }))
  fetch.head(dataSource, () => new Response(null, etag && { headers: { ETag: etag } }))
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
  await tick(7)
  await secondCallback(db, dataSource)
  await db.close()

  // third time - no update, data is v2
  mockEmoji(dataSource, secondData, 'v2')

  db = new Database({ dataSource })
  await db.ready()
  await tick(7)

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
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)
      expect((await db.getEmojiByShortcode('rofl')).annotation).toBe('rolling on the floor laughing')
      expect(await db.getEmojiByShortcode('weary_cat')).toBeFalsy()
    }, async (db, dataSource) => {
      // second load
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)
      expect(fetch).toHaveBeenNthCalledWith(1, dataSource, { method: 'HEAD' })
      expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
      expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    }, async (db, dataSource) => {
      // third load
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenLastCalledWith(dataSource, { method: 'HEAD' })
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
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)

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
    await tick(7)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(dataSource, undefined)
    expect(fetch).toHaveBeenNthCalledWith(1, dataSource, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')
    await db.close()

    // third time - no update, data is v2
    mockEmoji(dataSource, changedEmoji)

    db = new Database({ dataSource })
    await db.ready()
    await tick(7)
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
    await tick(7)
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
    await tick(7)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(dataSource2, { method: 'HEAD' })
    expect((await db.getEmojiByShortcode('rofl'))).toBeFalsy()
    expect((await db.getEmojiByShortcode('pineapple')).annotation).toBe('pineapple')

    await db.delete()
  })
})
