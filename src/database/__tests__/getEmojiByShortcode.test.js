import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from './shared'
import Database from '../Database'

beforeEach(basicBeforeEach)
afterEach(basicAfterEach)

describe('getEmojiByShortcode', () => {
  test('basic test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect((await db.getEmojiByShortcode('monkey')).annotation).toEqual('monkey')
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
})
