import { ALL_EMOJI, basicAfterEach, basicBeforeEach } from '../shared'
import Database from '../../../src/database/Database'

describe('database tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('get and set preferred skin tone', async () => {
    const db = new Database({ dataSource: ALL_EMOJI })
    expect(await db.getPreferredSkinTone()).toBe(0)
    await db.setPreferredSkinTone(5)
    expect(await db.getPreferredSkinTone()).toBe(5)
    await expect(() => db.setPreferredSkinTone()).rejects.toThrow()
    await db.delete()
  })
})
