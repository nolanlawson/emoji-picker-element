import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../src/database/Database'
import allEmoji from 'emojibase-data/en/data.json'
import { transformEmojiBaseData } from '../../../src/database/utils/transformEmojiBaseData'

const transformedEmoji = transformEmojiBaseData(allEmoji)

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
    expect(await db.getTopFavoriteEmoji(10)).toStrictEqual([
      transformedEmoji.find(_ => _.unicode === '🐵')
    ])
    // TODO: test more than 10 favorite emoji
    // TODO: test nonexistent emoji
    // TODO: add typescript documentation
    // TODO: can we just index the key of a keyvalue store?
  })
})
