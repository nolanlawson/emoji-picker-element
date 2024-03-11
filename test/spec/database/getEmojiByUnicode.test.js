import allEmoji from 'emoji-picker-element-data/en/emojibase/data.json'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'
import { mockGetAndHead } from '../mockFetch.js'

describe('getEmojiByUnicode', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('basic test', async () => {
    const pirate = allEmoji.find(_ => _.annotation === 'pirate flag')
    const emojiPlusPirateFlag = [
      ...truncatedEmoji,
      pirate
    ]
    const EMOJI_WITH_PIRATES = 'http://localhost/pirate.json'

    mockGetAndHead(EMOJI_WITH_PIRATES, emojiPlusPirateFlag, { headers: { ETag: 'W/yarrr' } })

    const db = new Database({ dataSource: EMOJI_WITH_PIRATES })

    expect((await db.getEmojiByUnicodeOrName('😀')).annotation).toBe('grinning face')
    expect((await db.getEmojiByUnicodeOrName('😀')).tokens).toBeFalsy()
    expect((await db.getEmojiByUnicodeOrName(pirate.emoji)).annotation).toBe('pirate flag')
    expect((await db.getEmojiByUnicodeOrName(pirate.emoji.substring(0, 1)))).toBe(null)
    expect((await db.getEmojiByUnicodeOrName('smile'))).toBe(null)
    expect((await db.getEmojiByUnicodeOrName('monkey_face'))).toBe(null)

    await db.delete()
  })

  test('all unicode values', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    for (const emoji of truncatedEmoji) {
      expect((await db.getEmojiByUnicodeOrName(emoji.emoji)).unicode).toEqual(emoji.emoji)
      if (emoji.skins) {
        for (const skin of emoji.skins) {
          expect((await db.getEmojiByUnicodeOrName(skin.emoji)).unicode).toEqual(emoji.emoji)
        }
      }
    }

    await db.delete()
  })

  test('errors', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    await expect(() => db.getEmojiByUnicodeOrName()).rejects.toThrow()
    await expect(() => db.getEmojiByUnicodeOrName(1)).rejects.toThrow()
    await expect(() => db.getEmojiByUnicodeOrName(null)).rejects.toThrow()
    await expect(() => db.getEmojiByUnicodeOrName('')).rejects.toThrow()

    await db.delete()
  })
})
