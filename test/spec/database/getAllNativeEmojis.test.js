import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../src/database/Database'

describe('getAllNativeEmojis', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)
  test('basic test', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })

    expect((await db.getAllNativeEmojis()).length).toBe(189)
    await db.delete()
  })
})
