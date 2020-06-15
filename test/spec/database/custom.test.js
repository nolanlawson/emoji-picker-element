import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'

const customEmojis = [
  {
    name: 'CapitalLettersLikeThis',
    shortcodes: ['CapitalLettersLikeThis'],
    url: 'caps.png'
  },
  {
    name: 'underscores_like_this',
    shortcodes: ['underscores_like_this'],
    url: 'underscores.png'
  },
  {
    name: 'a',
    shortcodes: ['a'],
    url: 'a.png'
  },
  {
    name: 'z',
    shortcodes: ['z'],
    url: 'z.png'
  },
  {
    name: 'monkey',
    shortcodes: ['monkey'], // conflicts with native emoji
    url: 'monkey.png'
  },
  {
    name: 'multiple_results_match',
    shortcodes: ['multiple_results_match'],
    url: 'multiple1.png'
  },
  {
    name: 'multiple_results_match_too',
    shortcodes: ['multiple_results_match_too'],
    url: 'multiple2.png'
  },
  {
    name: 'multiple_results_match_again',
    shortcodes: ['multiple_results_match_again'],
    url: 'multiple3.png'
  }
]

const summarize = ({ unicode, shortcodes, url, name }) => {
  const res = { shortcodes, url }
  if (unicode) {
    res.unicode = unicode
  }
  if (name) {
    res.name = name
  }
  return res
}

const summaryByUnicode = unicode => {
  const emoji = truncatedEmoji.find(_ => _.emoji === unicode)
  return summarize({
    unicode: emoji.emoji,
    shortcodes: emoji.shortcodes
  })
}

describe('custom emoji', () => {
  let db

  beforeEach(async () => {
    basicBeforeEach()
    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
  })
  afterEach(async () => {
    basicAfterEach()
    await db.delete()
  })

  test('errors', () => {
    db.customEmoji = [] // empty arrays are fine
    expect(() => { db.customEmoji = null }).toThrow(/Expected custom emojis/)
    expect(() => { db.customEmoji = 'foo' }).toThrow(/Expected custom emojis/)
    expect(() => { db.customEmoji = [{}] }).toThrow(/Expected custom emojis/)
    expect(() => { db.customEmoji = [null] }).toThrow(/Expected custom emojis/)
  })

  test('getEmojiByShortcode', async () => {
    db.customEmoji = customEmojis
    expect(db.customEmoji).toStrictEqual(customEmojis)
    expect(await db.getEmojiByShortcode('capitalletterslikethis')).toStrictEqual(
      { name: 'CapitalLettersLikeThis', shortcodes: ['CapitalLettersLikeThis'], url: 'caps.png' }
    )
    expect(await db.getEmojiByShortcode('underscores_like_this')).toStrictEqual(
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    )
    expect(await db.getEmojiByShortcode('Underscores_Like_This')).toStrictEqual(
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    )
    // custom emoji take precedence over native in case of conflict
    expect(await db.getEmojiByShortcode('monkey')).toStrictEqual(
      { name: 'monkey', shortcodes: ['monkey'], url: 'monkey.png' }
    )
  })

  test('getEmojiBySearchQuery', async () => {
    db.customEmoji = customEmojis

    expect((await db.getEmojiBySearchQuery('monkey')).map(summarize)).toStrictEqual([
      { name: 'monkey', shortcodes: ['monkey'], url: 'monkey.png' },
      summaryByUnicode('🐵'),
      summaryByUnicode('🐒')
    ])

    expect((await db.getEmojiBySearchQuery('undersc'))).toStrictEqual([
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('underscores lik'))).toStrictEqual([
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('undersc like'))).toStrictEqual([])
    expect((await db.getEmojiBySearchQuery('undersc lik'))).toStrictEqual([])

    expect((await db.getEmojiBySearchQuery('underscores like'))).toStrictEqual([
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    ])
    expect((await db.getEmojiBySearchQuery('underscores like th'))).toStrictEqual([
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    ])
    expect((await db.getEmojiBySearchQuery('underscores like this'))).toStrictEqual([
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('multiple match'))).toStrictEqual([
      {
        name: 'multiple_results_match',
        shortcodes: ['multiple_results_match'],
        url: 'multiple1.png'
      },
      {
        name: 'multiple_results_match_again',
        shortcodes: ['multiple_results_match_again'],
        url: 'multiple3.png'
      },
      {
        name: 'multiple_results_match_too',
        shortcodes: ['multiple_results_match_too'],
        url: 'multiple2.png'
      }
    ])
  })

  test('increment favorites with custom', async () => {
    db.customEmoji = customEmojis

    const counts = {
      '🐵': 5,
      '🐒': 4,
      '🤣': 2,
      '🖐️': 1,
      '🤏': 6,
      '✌️': 8,
      '🐶': 9,
      '🎉': 3,
      '✨': 3,
      CapitalLettersLikeThis: 3,
      underscores_like_this: 6,
      monkey: 5
    }

    for (const [unicodeOrShortcode, count] of Object.entries(counts)) {
      for (let i = 0; i < count; i++) {
        await db.incrementFavoriteEmojiCount(unicodeOrShortcode)
      }
    }

    expect((await db.getTopFavoriteEmoji(10)).map(summarize)).toStrictEqual([
      summaryByUnicode('🐶'),
      summaryByUnicode('✌️'),
      summaryByUnicode('🤏'),
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' },
      summaryByUnicode('🐵'),
      { name: 'monkey', shortcodes: ['monkey'], url: 'monkey.png' },
      summaryByUnicode('🐒'),
      summaryByUnicode('🎉'),
      summaryByUnicode('✨'),
      { name: 'CapitalLettersLikeThis', shortcodes: ['CapitalLettersLikeThis'], url: 'caps.png' }
    ])

    expect((await db.getTopFavoriteEmoji(20)).map(summarize)).toStrictEqual([
      summaryByUnicode('🐶'),
      summaryByUnicode('✌️'),
      summaryByUnicode('🤏'),
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' },
      summaryByUnicode('🐵'),
      { name: 'monkey', shortcodes: ['monkey'], url: 'monkey.png' },
      summaryByUnicode('🐒'),
      summaryByUnicode('🎉'),
      summaryByUnicode('✨'),
      { name: 'CapitalLettersLikeThis', shortcodes: ['CapitalLettersLikeThis'], url: 'caps.png' },
      summaryByUnicode('🤣'),
      summaryByUnicode('🖐️')
    ])

    db.customEmoji = []
    // favorites are now in the database but missing from the in-memory index, so we should just skip them
    expect((await db.getTopFavoriteEmoji(10)).map(summarize)).toStrictEqual([
      summaryByUnicode('🐶'),
      summaryByUnicode('✌️'),
      summaryByUnicode('🤏'),
      summaryByUnicode('🐵'),
      summaryByUnicode('🐒'),
      summaryByUnicode('🎉'),
      summaryByUnicode('✨'),
      summaryByUnicode('🤣'),
      summaryByUnicode('🖐️')
    ])
  })

  test('get custom emoji by name', async () => {
    db.customEmoji = customEmojis
    expect(await db.getEmojiByUnicodeOrName('underscores_like_this')).toStrictEqual(
      { name: 'underscores_like_this', shortcodes: ['underscores_like_this'], url: 'underscores.png' }
    )
    expect(await db.getEmojiByUnicodeOrName('capitalletterslikethis')).toStrictEqual(
      { name: 'CapitalLettersLikeThis', shortcodes: ['CapitalLettersLikeThis'], url: 'caps.png' }
    )
    expect(await db.getEmojiByUnicodeOrName('unknown')).toBeNull()
  })
})
