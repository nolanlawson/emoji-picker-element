import { basicBeforeEach, basicAfterEach, ALL_EMOJI, tick } from './shared'
import { getAllByRole, getByRole } from '@testing-library/dom'
import { Picker } from '../index.js'

describe('Picker tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('basic picker test', async () => {
    expect(process.env.NODE_ENV).toBe('test')
    const picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    const container = picker.shadowRoot
    await tick(20)
    expect(getByRole(container, 'button', { name: 'Choose a skin tone' })).toBeVisible()
    expect(getAllByRole(container, 'tab')).toHaveLength(9)
    await picker.database.delete()
  })
})
