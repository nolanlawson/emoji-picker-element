import { vi } from 'vitest'
import Picker from '../../../src/picker/PickerElement'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Database from '../../../src/database/Database'
import { getByRole, waitFor } from '@testing-library/dom'
import { mock500GetAndHead, mockGetAndHead } from '../mockFetch.js'

describe('errors', () => {
  let errorSpy

  beforeEach(async () => {
    await basicBeforeEach()
    errorSpy = vi.spyOn(global.console, 'error').mockImplementation(() => undefined)
    await tick(40)
  })
  afterEach(async () => {
    await tick(40)
    await basicAfterEach()
    errorSpy.mockRestore()
    await tick(40)
  })

  test('throws error when setting the database', async () => {
    const picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    await tick(20)
    expect(() => {
      picker.database = null
    }).toThrow(/database is read-only/)
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
  })

  test('offline shows an error', async () => {
    const dataSource = 'error.json'

    mock500GetAndHead(dataSource)

    const picker = new Picker({ dataSource })
    const container = picker.shadowRoot
    document.body.appendChild(picker)

    await tick(20)

    await expect(picker.database.ready()).rejects.toThrow()

    await waitFor(() => expect(getByRole(container, 'alert').innerHTML).toContain('Could not load'))

    await new Database({ dataSource: ALL_EMOJI }).delete() // use different dataSource so it deletes properly
    document.body.removeChild(picker)
    await tick(20)
  })

  test('slow networks show "Loading"', async () => {
    const dataSource = 'slow.json'

    mockGetAndHead(dataSource, truncatedEmoji, { headers: { ETag: 'W/slow' }, delay: 1500 })

    const picker = new Picker({ dataSource })
    const container = picker.shadowRoot
    document.body.appendChild(picker)
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'alert').innerHTML).toContain('Loading'), { timeout: 2000 })
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible(), { timeout: 2000 })

    await new Database({ dataSource }).delete()
    document.body.removeChild(picker)
    await tick(20)
  }, 5000)
})
