import { basicAfterEach, basicBeforeEach, mockDefaultDataSource, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getByRole, waitFor } from '@testing-library/dom'
import { DEFAULT_DATA_SOURCE } from '../../../src/database/constants'

describe('lifecycle', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('can remove and re-append custom element', async () => {
    mockDefaultDataSource()
    const picker = new Picker()
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)

    const spy = jest.spyOn(picker.database, 'close')

    document.body.removeChild(picker)
    await tick(20)

    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()

    document.body.appendChild(picker)
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('database.close() is called when disconnected', async () => {
    mockDefaultDataSource()
    const picker = new Picker()
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    const spy = jest.spyOn(picker.database, 'close')

    document.body.removeChild(picker)
    await tick(20)

    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
})