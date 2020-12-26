import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'

describe('getEmojiByShortcode', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('basic test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByShortcode('monkey')).annotation).toEqual('monkey')
    expect((await db.getEmojiByShortcode('monkey')).tokens).toBeFalsy()
    expect((await db.getEmojiByShortcode('monkey_face')).annotation).toEqual('monkey face')
    expect((await db.getEmojiByShortcode('MONKEY')).annotation).toEqual('monkey')
    expect((await db.getEmojiByShortcode('MONKEY_FACE')).annotation).toEqual('monkey face')

    expect((await db.getEmojiByShortcode('face monkey'))).toBe(null)
    expect((await db.getEmojiByShortcode('monk'))).toBe(null)
    expect((await db.getEmojiByShortcode(':monkey_face:'))).toBe(null)
    await db.delete()
  })

  test('errors', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    await expect(() => db.getEmojiByShortcode()).rejects.toThrow()
    await expect(() => db.getEmojiByShortcode(1)).rejects.toThrow()
    await expect(() => db.getEmojiByShortcode(null)).rejects.toThrow()
    await expect(() => db.getEmojiByShortcode('')).rejects.toThrow()

    await db.delete()
  })

  test('all shortcodes are queryable', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    for (const emoji of truncatedEmoji) {
      for (const shortcode of emoji.shortcodes) {
        expect((await db.getEmojiByShortcode(shortcode)).unicode).toEqual(emoji.emoji)
        // test uppercase too
        expect((await db.getEmojiByShortcode(shortcode.toUpperCase())).unicode).toEqual(emoji.emoji)
      }
    }

    await db.delete()
  })

  test('short nonexistent shortcodes', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    expect(await db.getEmojiByShortcode('z')).toEqual(null)
    expect(await db.getEmojiByShortcode('1')).toEqual(null)
    expect(await db.getEmojiByShortcode(' ')).toEqual(null)

    await db.delete()
  })

  test('works although shortcodes are optional', async () => {
    const dataSource = 'http://localhost/shortcodes-optional.json'
    const emojis = JSON.parse(JSON.stringify(truncatedEmoji))
    for (const emoji of emojis) {
      if (!emoji.shortcodes.includes('dog_face')) {
        delete emoji.shortcodes
      }
    }

    fetch
      .get(dataSource, () => new Response(JSON.stringify(emojis), { headers: { ETag: 'W/optional' } }))
      .head(dataSource, () => new Response(null, { headers: { ETag: 'W/optional' } }))

    const db = new Database({ dataSource })

    expect((await db.getEmojiByShortcode('dog_face')).unicode).toEqual('🐶')
    expect(await db.getEmojiByShortcode('monkey_face')).toEqual(null)

    await db.delete()
  })
})
