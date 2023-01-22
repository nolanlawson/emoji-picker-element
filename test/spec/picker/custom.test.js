import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick } from '../shared'
import { groups } from '../../../src/picker/groups'
import Picker from '../../../src/picker/PickerElement'
import { getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import { getAccessibleName } from '../utils'

describe('Custom emojis tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('Setting custom emoji shows the proper first page', async () => {
    const picker = new Picker({
      locale: 'en',
      dataSource: ALL_EMOJI
    })
    picker.customEmoji = [
      {
        name: 'monkey',
        shortcodes: ['monkey'],
        url: 'monkey.png'
      }
    ]
    document.body.appendChild(picker)

    const container = picker.shadowRoot.querySelector('.picker')

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length + 1))

    // We actually have to sleep here, because we want to test for a race condition where the
    // custom emoji show first, but then are replaced by the non-custom emoji
    // https://github.com/nolanlawson/emoji-picker-element/issues/84
    await tick(50)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: 'monkey' })).toBeVisible())

    await waitFor(async () => (
      expect(
        await Promise.all(getAllByRole(container, 'menu').map(node => getAccessibleName(container, node)))
      ).toStrictEqual([
        'Custom',
        'Favorites'
      ])
    ))

    // Visibility test, has nothing to do with accessibility. We don't visually show the label if there's
    // just one category and it's the default "Custom" one.
    expect(container.querySelector('.category').textContent).toEqual('Custom')
    expect(container.querySelector('.category')).toHaveClass('gone')

    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
  })

  test('Setting custom emoji, selecting flags, unsetting custom emoji', async () => {
    const picker = new Picker({
      locale: 'en',
      dataSource: ALL_EMOJI
    })
    picker.customEmoji = [
      {
        name: 'themonkey',
        shortcodes: ['themonkey'],
        url: 'themonkey.png'
      }
    ]
    document.body.appendChild(picker)

    const container = picker.shadowRoot.querySelector('.picker')

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length + 1))

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: 'themonkey' })).toBeVisible())

    getByRole(container, 'tab', { name: 'Flags' }).click()

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🏁/ })).toBeVisible())

    picker.customEmoji = undefined

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length))

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🏁/ })).toBeVisible())

    expect(getByRole(container, 'tab', { name: 'Flags' }).getAttribute('aria-selected')).toEqual('true')

    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
  })

  test('Setting custom emoji, unsetting custom emoji', async () => {
    const picker = new Picker({
      locale: 'en',
      dataSource: ALL_EMOJI
    })
    picker.customEmoji = [
      {
        name: 'themonkey',
        shortcodes: ['themonkey'],
        url: 'themonkey.png'
      }
    ]
    document.body.appendChild(picker)

    const container = picker.shadowRoot.querySelector('.picker')

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length + 1))

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: 'themonkey' })).toBeVisible())

    picker.customEmoji = undefined

    await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length))

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    expect(getByRole(container, 'tab', { name: 'Smileys and emoticons' }).getAttribute('aria-selected')).toEqual('true')

    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
  })
})
