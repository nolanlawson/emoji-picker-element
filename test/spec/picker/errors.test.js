import Picker from '../../../src/picker/PickerElement'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick } from '../shared'
import Database from '../../../src/database/Database'
import { getByRole, waitFor } from '@testing-library/dom'

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

  // can't seem to get jest to ignore these expected errors
  test.skip('offline shows an error', async () => {
    const ERROR = 'error.json'

    fetch.get(ERROR, { body: null, status: 500 })
    fetch.head(ERROR, { body: null, status: 500 })

    const picker = new Picker({ dataSource: ERROR })
    await tick(20)

    await (expect(() => picker.database.ready())).rejects.toThrow()

    const container = picker.shadowRoot.querySelector('.picker')
    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(container, 'alert', { name: /Could not load emoji/ })).toBeVisible())

    await new Database({ dataSource: ALL_EMOJI }).delete()
    document.body.removeChild(picker)
  })
})
