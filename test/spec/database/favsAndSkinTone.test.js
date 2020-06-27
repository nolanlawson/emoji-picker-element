import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../src/database/Database'

describe('database tests', () => {
  let db

  beforeEach(() => {
    basicBeforeEach()
    db = new Database({ dataSource: ALL_EMOJI })
  })
  afterEach(async () => {
    basicAfterEach()
    await db.delete()
  })

  test('get and set preferred skin tone', async () => {
    expect(await db.getPreferredSkinTone()).toBe(0)
    await db.setPreferredSkinTone(5)
    expect(await db.getPreferredSkinTone()).toBe(5)
    await expect(() => db.setPreferredSkinTone()).rejects.toThrow()
  })

  test('get and set favorite emoji', async () => {
    expect(await db.getTopFavoriteEmoji(10)).toStrictEqual([])
    await db.incrementFavoriteEmojiCount('🐵')
    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual([
      '🐵'
    ])

    for (let i = 0; i < 3; i++) {
      await db.incrementFavoriteEmojiCount('🐒')
    }
    for (let i = 0; i < 2; i++) {
      await db.incrementFavoriteEmojiCount('😀')
    }
    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual([
      '🐒',
      '😀',
      '🐵'
    ])

    expect((await db.getTopFavoriteEmoji(1))[0].tokens).toBeFalsy()
  })

  test('emoji favorite counts', async () => {
    await db.incrementFavoriteEmojiCount('🐵')
    const emojis = ['🐒', '😀', '🐵', '😅', '🤣', '🖐️', '🤏', '✌️', '🐶', '🎉', '✨']

    for (let i = 0; i < emojis.length; i++) {
      for (let j = 0; j < emojis.length - i + 1; j++) {
        await db.incrementFavoriteEmojiCount(emojis[i])
      }
    }

    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual(
      emojis.slice(0, 10)
    )
    expect((await db.getTopFavoriteEmoji(11)).map(_ => _.unicode)).toStrictEqual(
      emojis.slice(0, 11)
    )
    expect((await db.getTopFavoriteEmoji(3)).map(_ => _.unicode)).toStrictEqual(
      emojis.slice(0, 3)
    )
    expect((await db.getTopFavoriteEmoji(0)).map(_ => _.unicode)).toStrictEqual(
      []
    )
  })

  test('nonexistent emoji in favorites are ignored', async () => {
    await db.incrementFavoriteEmojiCount('fake')
    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual(
      []
    )
    await db.incrementFavoriteEmojiCount('0')
    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual(
      []
    )
    await db.incrementFavoriteEmojiCount('🐒')
    expect((await db.getTopFavoriteEmoji(10)).map(_ => _.unicode)).toStrictEqual(
      ['🐒']
    )
  })
})
