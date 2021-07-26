import { basicAfterEach, basicBeforeEach, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getByRole, waitFor, getAllByRole } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe('scrolling', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('can scroll', async () => {
    const picker = new Picker()
    const container = picker.shadowRoot

    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    const tabPanel = getByRole(container, 'tabpanel')

    await tick(20)
    expect(tabPanel.scrollTop).toEqual(0)

    tabPanel.scrollTop = 1

    await tick(20)
    expect(tabPanel.scrollTop).toEqual(1)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('scrollTop resets to 0 on changing tabs', async () => {
    const picker = new Picker()
    const container = picker.shadowRoot

    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    const tabPanel = getByRole(container, 'tabpanel')
    tabPanel.scrollTop = 1

    await tick(20)
    expect(tabPanel.scrollTop).toEqual(1)

    await userEvent.click(getByRole(container, 'tab', { name: 'People and body' }))

    await tick(20)
    expect(tabPanel.scrollTop).toEqual(0)

    await userEvent.click(getByRole(container, 'tab', { name: 'Smileys and emoticons' }))

    await tick(20)
    expect(tabPanel.scrollTop).toEqual(0)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('scrollTop resets to 0 on changing search input', async () => {
    const picker = new Picker()
    const container = picker.shadowRoot

    document.body.appendChild(picker)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())
    const tabPanel = getByRole(container, 'tabpanel')

    await userEvent.type(getByRole(container, 'combobox'), 'monkey')

    await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(2))
    expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()

    tabPanel.scrollTop = 1

    await tick(40)
    expect(tabPanel.scrollTop).toEqual(1)

    await userEvent.type(getByRole(container, 'combobox'), ' face')

    await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1))
    expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()

    await tick(40)
    expect(tabPanel.scrollTop).toEqual(0)

    document.body.removeChild(picker)
    await tick(20)
  })
})
