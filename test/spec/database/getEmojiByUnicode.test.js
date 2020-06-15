import allEmoji from 'emojibase-data/en/data.json'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'

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

    fetch.get(EMOJI_WITH_PIRATES, () => new Response(JSON.stringify(emojiPlusPirateFlag), {
      headers: { ETag: 'W/yarrr' }
    }))
    fetch.head(EMOJI_WITH_PIRATES, () => new Response(null, { headers: { ETag: 'W/yarrr' } }))

    const db = new Database({ dataSource: EMOJI_WITH_PIRATES })

    expect((await db.getEmojiByUnicodeOrName('😀')).annotation).toBe('grinning face')
    expect((await db.getEmojiByUnicodeOrName(pirate.emoji)).annotation).toBe('pirate flag')
    expect((await db.getEmojiByUnicodeOrName(pirate.emoji.substring(0, 1)))).toBe(null)
    expect((await db.getEmojiByUnicodeOrName('smile'))).toBe(null)
    expect((await db.getEmojiByUnicodeOrName('monkey_face'))).toBe(null)

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
