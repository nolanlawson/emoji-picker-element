import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from './shared'
import Database from '../Database'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('getEmojiByGroup', () => {
  test('basic test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    expect((await db.getEmojiByGroup(1)).length).toBe(20)
    expect((await db.getEmojiByGroup(2)).length).toBe(9)
    expect((await db.getEmojiByGroup(3)).length).toBe(20)

    await db.delete()
  })

  test('ordering', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    const emojis = await db.getEmojiByGroup(1)
    const orderings = emojis.map(_ => _.order)
    expect(orderings.slice().sort((a, b) => a < b ? -1 : 1)).toStrictEqual(orderings)

    await db.delete()
  })

  test('errors', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    await expect(() => db.getEmojiByGroup()).rejects.toThrow()
    await expect(() => db.getEmojiByGroup('foo')).rejects.toThrow()
    await expect(() => db.getEmojiByGroup(null)).rejects.toThrow()
    await expect(() => db.getEmojiByGroup('')).rejects.toThrow()

    await db.delete()
  })
})
