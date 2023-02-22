import { basicAfterEach, basicBeforeEach, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getByRole, waitFor } from '@testing-library/dom'
import { DEFAULT_DATA_SOURCE } from '../../../src/database/constants'
import { openIndexedDBRequests } from '../../../src/database/databaseLifecycle.js'

describe('lifecycle', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('can remove and re-append custom element', async () => {
    const picker = new Picker()
    const container = picker.shadowRoot

    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)

    document.body.removeChild(picker)
    await tick(20)

    document.body.appendChild(picker)
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // fetch is called once again after re-insertion
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, { method: 'HEAD' })

    document.body.removeChild(picker)
    await tick(60)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('database.close() is called when disconnected', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    const container = picker.shadowRoot

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    const spy = jest.spyOn(picker.database, 'close')

    document.body.removeChild(picker)
    await tick(60)

    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('connect and immediately disconnect', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    document.body.removeChild(picker)

    await tick(60)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('connect and immediately disconnect twice', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    document.body.removeChild(picker)
    document.body.appendChild(picker)
    document.body.removeChild(picker)

    await tick(60)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('connect, disconnect, and reconnect with a particular timing (#225)', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    await tick(1)
    document.body.removeChild(picker)
    document.body.appendChild(picker)

    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    await tick(20)
    document.body.removeChild(picker)
    await tick(60)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('preserves state if component is disconnected and reconnected synchronously', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)
    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    document.body.removeChild(picker)
    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1) // fetch is not called again because no re-render
    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    await tick(20)
    document.body.removeChild(picker)
    await tick(60)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('does not preserve state if component is disconnected and reconnected in separate microtasks', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)
    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    document.body.removeChild(picker)
    await Promise.resolve()
    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(2) // fetch is called again due to re-render
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, { method: 'HEAD' }) // cached, so does a HEAD
    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    await tick(20)
    document.body.removeChild(picker)
    await tick(60)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })

  test('connect and immediately disconnect twice, then immediately reconnect', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    document.body.removeChild(picker)
    document.body.appendChild(picker)
    document.body.removeChild(picker)
    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)
    await expect(() => (
      expect(getByRole(picker.shadowRoot, 'option', { name: /😀/ })).toBeVisible()
    ))

    await tick(20)
    document.body.removeChild(picker)
    await tick(60)
    expect(Object.keys(openIndexedDBRequests).length).toBe(0) // no open IDB connections
  })
})
