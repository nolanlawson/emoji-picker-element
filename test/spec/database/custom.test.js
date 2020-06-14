import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'

const customEmojis = [
  {
    shortcode: 'CapitalLettersLikeThis',
    url: 'caps.png'
  },
  {
    shortcode: 'underscores_like_this',
    url: 'underscores.png'
  },
  {
    shortcode: 'a',
    url: 'a.png'
  },
  {
    shortcode: 'z',
    url: 'z.png'
  },
  {
    shortcode: 'monkey', // conflicts with native emoji
    url: 'monkey.png'
  },
  {
    shortcode: 'multiple_results_match',
    url: 'multiple1.png'
  },
  {
    shortcode: 'multiple_results_match_too',
    url: 'multiple2.png'
  },
  {
    shortcode: 'multiple_results_match_again',
    url: 'multiple3.png'
  }
]

const summarize = ({ unicode, shortcode, url }) => {
  const res = { shortcode, url }
  if (unicode) {
    res.unicode = unicode
  }
  return res
}

const summaryByUnicode = unicode => {
  const emoji = truncatedEmoji.find(_ => _.emoji === unicode)
  return summarize({
    unicode: emoji.emoji,
    shortcode: emoji.shortcode
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
      { shortcode: 'CapitalLettersLikeThis', url: 'caps.png' }
    )
    expect(await db.getEmojiByShortcode('underscores_like_this')).toStrictEqual(
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    )
    expect(await db.getEmojiByShortcode('Underscores_Like_This')).toStrictEqual(
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    )
    // custom emoji take precedence over native in case of conflict
    expect(await db.getEmojiByShortcode('monkey')).toStrictEqual(
      { shortcode: 'monkey', url: 'monkey.png' }
    )
  })

  test('getEmojiBySearchQuery', async () => {
    db.customEmoji = customEmojis

    expect((await db.getEmojiBySearchQuery('monkey')).map(summarize)).toStrictEqual([
      { shortcode: 'monkey', url: 'monkey.png' },
      summaryByUnicode('🐵'),
      summaryByUnicode('🐒')
    ])

    expect((await db.getEmojiBySearchQuery('undersc'))).toStrictEqual([
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('underscores lik'))).toStrictEqual([
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('undersc like'))).toStrictEqual([
    ])
    expect((await db.getEmojiBySearchQuery('undersc lik'))).toStrictEqual([
    ])

    expect((await db.getEmojiBySearchQuery('underscores like'))).toStrictEqual([
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    ])
    expect((await db.getEmojiBySearchQuery('underscores like th'))).toStrictEqual([
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    ])
    expect((await db.getEmojiBySearchQuery('underscores like this'))).toStrictEqual([
      { shortcode: 'underscores_like_this', url: 'underscores.png' }
    ])

    expect((await db.getEmojiBySearchQuery('multiple match'))).toStrictEqual([
      {
        shortcode: 'multiple_results_match',
        url: 'multiple1.png'
      },
      {
        shortcode: 'multiple_results_match_again',
        url: 'multiple3.png'
      },
      {
        shortcode: 'multiple_results_match_too',
        url: 'multiple2.png'
      }
    ])
  })
})
