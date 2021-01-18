import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import Database from '../../../src/database/Database'
import { pick, omit } from 'lodash-es'
import { basicAfterEach, basicBeforeEach, ALL_EMOJI, truncatedEmoji } from '../shared'

// order can change from version to version
const expectToBeSorted = results => {
  const orders = results.map(_ => _.order)
  expect(orders.sort()).toStrictEqual(orders)
}

describe('getEmojiBySearchQuery', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)
  test('basic searches', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    const search = async query => (await db.getEmojiBySearchQuery(query)).map(_ => pick(_, ['annotation', 'order']))
    let results = await search('face')
    expectToBeSorted(results)
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'grinning face' },
      { annotation: 'grinning face with big eyes' },
      { annotation: 'grinning face with smiling eyes' },
      { annotation: 'beaming face with smiling eyes' },
      { annotation: 'grinning squinting face' },
      { annotation: 'grinning face with sweat' },
      { annotation: 'rolling on the floor laughing' },
      { annotation: 'face with tears of joy' },
      { annotation: 'slightly smiling face' },
      { annotation: 'upside-down face' },
      { annotation: 'winking face' },
      { annotation: 'smiling face with smiling eyes' },
      { annotation: 'smiling face with halo' },
      { annotation: 'smiling face with hearts' },
      { annotation: 'smiling face with heart-eyes' },
      { annotation: 'star-struck' },
      { annotation: 'face blowing a kiss' },
      { annotation: 'kissing face' },
      { annotation: 'smiling face' },
      { annotation: 'kissing face with closed eyes' },
      { annotation: 'monkey face' },
      { annotation: 'dog face' },
      { annotation: 'wolf' },
      { annotation: 'fox' },
      { annotation: 'cat face' },
      { annotation: 'lion' },
      { annotation: 'tiger face' },
      { annotation: 'horse face' }
    ])
    results = await search('monk')
    expectToBeSorted(results)
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' },
      { annotation: 'monkey' }
    ])
    results = await search('monkey')
    expectToBeSorted(results)
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' },
      { annotation: 'monkey' }
    ])
    results = await search('monkey')
    expectToBeSorted(results)
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' },
      { annotation: 'monkey' }
    ])
    results = await search('MoNkEy')
    expectToBeSorted(results)
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' },
      { annotation: 'monkey' }
    ])
    results = await search('monkey fac')
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' }
    ])
    results = await search('face monk')
    expect(results.map(_ => omit(_, ['order']))).toStrictEqual([
      { annotation: 'monkey face' }
    ])
    expect((await search('face monk'))[0].tokens).toBeFalsy()
    expect(await search('monkey facee')).toStrictEqual([])
    expect(await search('monk face')).toStrictEqual([])
    await db.delete()
  })

  test('ordering', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    const checkOrdering = emojis => {
      expect(emojis.length).toBeGreaterThan(0)
      const orderings = emojis.map(_ => _.order)
      expect(orderings.slice().sort((a, b) => a < b ? -1 : 1)).toStrictEqual(orderings)
    }

    checkOrdering(await db.getEmojiBySearchQuery('face'))
    checkOrdering(await db.getEmojiBySearchQuery('smile'))
    checkOrdering(await db.getEmojiBySearchQuery('grin'))
    checkOrdering(await db.getEmojiBySearchQuery('monkey'))
    checkOrdering(await db.getEmojiBySearchQuery('cat'))

    await db.delete()
  })

  test('emoticons', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiBySearchQuery(';)')).map(_ => _.annotation)).toStrictEqual([
      'winking face'
    ])
    expect((await db.getEmojiBySearchQuery(':*')).map(_ => _.annotation)).toStrictEqual([
      'kissing face with closed eyes'
    ])
    expect((await db.getEmojiBySearchQuery(':)')).map(_ => _.annotation)).toStrictEqual([
      'slightly smiling face'
    ])

    await db.delete()
  })

  test('apostrophes', async () => {
    const emojiWithTwelveOclock = [
      ...truncatedEmoji,
      allEmoji.find(_ => _.annotation === 'twelve o’clock'),
      allEmoji.find(_ => _.annotation === 'woman’s boot')
    ]

    const EMOJI_WITH_APOS = 'http://localhost/apos.json'

    fetch.get(EMOJI_WITH_APOS, () => new Response(JSON.stringify(emojiWithTwelveOclock), {
      headers: { ETag: 'W/apos' }
    }))
    fetch.head(EMOJI_WITH_APOS, () => new Response(null, { headers: { ETag: 'W/apos' } }))

    const db = new Database({ dataSource: EMOJI_WITH_APOS })

    expect((await db.getEmojiBySearchQuery("o'clock")).map(_ => _.annotation)).toStrictEqual([
      'twelve o’clock'
    ])
    expect((await db.getEmojiBySearchQuery('o’clock')).map(_ => _.annotation)).toStrictEqual([
      'twelve o’clock'
    ])
    expect((await db.getEmojiBySearchQuery("woman's boot")).map(_ => _.annotation)).toStrictEqual([
      'woman’s boot'
    ])
    expect((await db.getEmojiBySearchQuery('woman’s boot')).map(_ => _.annotation)).toStrictEqual([
      'woman’s boot'
    ])

    await db.delete()
  })

  test('colons', async () => {
    const emoji = [
      ...truncatedEmoji,
      allEmoji.find(_ => _.annotation === 'person: blond hair')
    ]

    const EMOJI = 'http://localhost/apos.json'

    fetch.get(EMOJI, () => new Response(JSON.stringify(emoji), {
      headers: { ETag: 'W/blond' }
    }))
    fetch.head(EMOJI, () => new Response(null, { headers: { ETag: 'W/blond' } }))

    const db = new Database({ dataSource: EMOJI })

    expect((await db.getEmojiBySearchQuery('person')).map(_ => _.annotation)).toContain('person: blond hair')
    expect((await db.getEmojiBySearchQuery('blond')).map(_ => _.annotation)).toContain('person: blond hair')
    expect((await db.getEmojiBySearchQuery('hair')).map(_ => _.annotation)).toContain('person: blond hair')
    expect((await db.getEmojiBySearchQuery('blon')).map(_ => _.annotation)).toContain('person: blond hair')

    await db.delete()
  })

  test('errors', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    await expect(() => db.getEmojiBySearchQuery()).rejects.toThrow()
    await expect(() => db.getEmojiBySearchQuery(1)).rejects.toThrow()
    await expect(() => db.getEmojiBySearchQuery(null)).rejects.toThrow()
    await expect(() => db.getEmojiBySearchQuery('')).rejects.toThrow()

    await db.delete()
  })

  test('emoticons, shortcodes', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    expect((await db.getEmojiBySearchQuery(';)')).map(_ => _.annotation)).toStrictEqual(['winking face'])
    expect((await db.getEmojiBySearchQuery(':wink:')).map(_ => _.annotation)).toStrictEqual(['winking face'])
    expect((await db.getEmojiBySearchQuery(' :wink: ')).map(_ => _.annotation)).toStrictEqual(['winking face'])
    expect((await db.getEmojiBySearchQuery(':)')).map(_ => _.annotation)).toStrictEqual(['slightly smiling face'])
    expect((await db.getEmojiBySearchQuery(' :) ')).map(_ => _.annotation)).toStrictEqual(['slightly smiling face'])
    expect((await db.getEmojiBySearchQuery(';)')).map(_ => _.annotation)).toStrictEqual(['winking face'])

    await db.delete()
  })

  test('more emoticons', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    const emoticons = truncatedEmoji.map(_ => _.emoticon).filter(Boolean)
    for (const emoticon of emoticons) {
      expect((await db.getEmojiBySearchQuery(emoticon)).map(_ => _.emoticon)).toContain(emoticon)
    }
    await db.delete()
  })

  test('search queries that result in no tokens', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    expect((await db.getEmojiBySearchQuery(';;;;'))).toStrictEqual([])
    expect((await db.getEmojiBySearchQuery('B&'))).toStrictEqual([])
  })
})
