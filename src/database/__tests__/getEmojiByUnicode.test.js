import allEmoji from 'emojibase-data/en/data.json'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from './shared'
import Database from '../Database'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('getEmojiByUnicode', () => {
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

    expect((await db.getEmojiByUnicode('😀')).annotation).toBe('grinning face')
    expect((await db.getEmojiByUnicode(pirate.emoji)).annotation).toBe('pirate flag')
    expect((await db.getEmojiByUnicode(pirate.emoji.substring(0, 1)))).toBe(null)
    expect((await db.getEmojiByUnicode('smile'))).toBe(null)
    expect((await db.getEmojiByUnicode('monkey_face'))).toBe(null)

    await db.delete()
  })

  test('errors', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    await expect(() => db.getEmojiByUnicode()).rejects.toThrow()
    await expect(() => db.getEmojiByUnicode(1)).rejects.toThrow()
    await expect(() => db.getEmojiByUnicode(null)).rejects.toThrow()
    await expect(() => db.getEmojiByUnicode('')).rejects.toThrow()

    await db.delete()
  })
})
