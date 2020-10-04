import Picker from '../../../picker.js'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Database from '../../../database.js'
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
    await tick(20)
  })

  // can't seem to get jest to ignore these expected errors
  test.skip('offline shows an error', async () => {
    const dataSource = 'error.json'

    fetch.get(dataSource, { body: null, status: 500 })
    fetch.head(dataSource, { body: null, status: 500 })

    const picker = new Picker({ dataSource })
    const container = picker.shadowRoot.querySelector('.picker')
    document.body.appendChild(picker)

    await tick(20)

    await expect(picker.database.ready()).rejects.toThrow()

    await waitFor(() => expect(getByRole(container, 'alert').innerHTML).toContain('Could not load'))

    await new Database({ dataSource: ALL_EMOJI }).delete()
    document.body.removeChild(picker)
    await tick(20)
  })

  test('slow networks show "Loading"', async () => {
    const dataSource = 'slow.json'

    fetch.get(dataSource, () => new Response(JSON.stringify(truncatedEmoji), { headers: { ETag: 'W/slow' } }),
      { delay: 1500 })
    fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/slow' } }),
      { delay: 1500 })

    const picker = new Picker({ dataSource })
    const container = picker.shadowRoot.querySelector('.picker')
    document.body.appendChild(picker)
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'alert').innerHTML).toContain('Loading'), { timeout: 2000 })
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible(), { timeout: 2000 })

    await new Database({ dataSource }).delete()
    document.body.removeChild(picker)
    await tick(20)
  }, 5000)
})
