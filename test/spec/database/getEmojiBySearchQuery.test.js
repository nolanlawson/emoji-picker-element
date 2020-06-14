import allEmoji from 'emojibase-data/en/data.json'
import Database from '../../../src/database/Database'
import { pick } from 'lodash-es'
import { basicAfterEach, basicBeforeEach, ALL_EMOJI, truncatedEmoji } from '../shared'

describe('getEmojiBySearchQuery', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)
  test('basic searches', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    const search = async query => (await db.getEmojiBySearchQuery(query)).map(_ => pick(_, ['annotation', 'order']))
    expect(await search('face')).toStrictEqual([
      { annotation: 'grinning face', order: 1 },
      { annotation: 'grinning face with big eyes', order: 2 },
      { annotation: 'grinning face with smiling eyes', order: 3 },
      { annotation: 'beaming face with smiling eyes', order: 4 },
      { annotation: 'grinning squinting face', order: 5 },
      { annotation: 'grinning face with sweat', order: 6 },
      { annotation: 'rolling on the floor laughing', order: 7 },
      { annotation: 'face with tears of joy', order: 8 },
      { annotation: 'slightly smiling face', order: 9 },
      { annotation: 'upside-down face', order: 10 },
      { annotation: 'winking face', order: 11 },
      { annotation: 'smiling face with smiling eyes', order: 12 },
      { annotation: 'smiling face with halo', order: 13 },
      { annotation: 'smiling face with hearts', order: 14 },
      { annotation: 'smiling face with heart-eyes', order: 15 },
      { annotation: 'star-struck', order: 16 },
      { annotation: 'face blowing a kiss', order: 17 },
      { annotation: 'kissing face', order: 18 },
      { annotation: 'smiling face', order: 20 },
      { annotation: 'kissing face with closed eyes', order: 21 },
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'dog face', order: 2661 },
      { annotation: 'wolf', order: 2666 },
      { annotation: 'fox', order: 2667 },
      { annotation: 'cat face', order: 2669 },
      { annotation: 'lion', order: 2672 },
      { annotation: 'tiger face', order: 2673 },
      { annotation: 'horse face', order: 2676 }
    ])
    expect(await search('monk')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('MoNkEy')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 },
      { annotation: 'monkey', order: 2658 }
    ])
    expect(await search('monkey fac')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 }
    ])
    expect(await search('face monk')).toStrictEqual([
      { annotation: 'monkey face', order: 2657 }
    ])
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

    await db.delete()
  })
})
