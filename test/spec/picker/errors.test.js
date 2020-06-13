import Picker from '../../../src/picker/PickerElement'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick } from '../shared'
import Database from '../../../src/database/Database'

describe('errors', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  // seems not possible to do
  test.skip('throws error when setting the database', async () => {
    const picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    await tick(20)
    expect(() => {
      picker.database = null
    }).toThrow()
    await tick(20)
    await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
  })
})
