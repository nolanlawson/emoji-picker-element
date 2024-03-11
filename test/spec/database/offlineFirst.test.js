import { vi } from 'vitest'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../src/database/Database'
import { mock500GetAndHead } from '../mockFetch.js'

describe('offline first', () => {
  beforeEach(() => {
    basicBeforeEach()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })
  afterEach(basicAfterEach)

  test('basic offline first test', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.close()
    fetch.reset()

    mock500GetAndHead(ALL_EMOJI)

    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    await expect(() => db._lazyUpdate).rejects.toThrow()
    expect((await db.getEmojiByUnicodeOrName('🐵')).annotation).toBe('monkey face')
    await db.close()
    await db.delete()
  })

  test('basic error test', async () => {
    const ERROR = 'error.json'
    mock500GetAndHead(ERROR)

    const db = new Database({ dataSource: ERROR })
    await (expect(() => db.ready())).rejects.toThrow()

    await new Database({ dataSource: ALL_EMOJI }).delete()
  })
})
