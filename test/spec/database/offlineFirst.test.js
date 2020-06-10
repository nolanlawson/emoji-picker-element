import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../database.js'

describe('offline first', () => {
  beforeEach(() => {
    basicBeforeEach()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(basicAfterEach)

  test('basic offline first test', async () => {
    let db = new Database({ dataSource: ALL_EMOJI })
    await db.close()
    fetch.mockClear()
    fetch.reset()

    fetch.get(ALL_EMOJI, { body: null, status: 500 })
    fetch.head(ALL_EMOJI, { body: null, status: 500 })

    db = new Database({ dataSource: ALL_EMOJI })
    await db.ready()
    expect(() => db._lazyUpdate).rejects.toThrow()
    expect((await db.getEmojiByUnicode('🐵')).annotation).toBe('monkey face')
    await db.close()
    await db.delete()
  })
})
