import {
  basicAfterEach,
  basicBeforeEach,
  FR_EMOJI,
  mockFrenchDataSource,
  tick
} from '../shared'
import { getByRole, waitFor } from '@testing-library/dom'

describe('upgrade tests', () => {
  beforeEach(async () => {
    basicBeforeEach()
    mockFrenchDataSource()
  })
  afterEach(async () => {
    await basicAfterEach()
  })

  test('setting props and attributes before upgrade', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    div.innerHTML = '<emoji-picker locale="fr"></emoji-picker>'

    const picker = div.querySelector('emoji-picker')
    picker.dataSource = FR_EMOJI
    picker.skinToneEmoji = '👍'

    expect(picker.shadowRoot).toBeNull()

    await tick(20)

    expect(fetch).not.toHaveBeenCalled()

    await import('../../../src/picker/PickerElement')

    await waitFor(() => expect(getByRole(picker.shadowRoot, 'menuitem', { name: /😀/ })).toBeVisible())

    const container = picker.shadowRoot

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)

    expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👍')

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(FR_EMOJI)

    // The setter should now work as expected
    picker.skinToneEmoji = '✌'

    await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('✌'))

    document.body.removeChild(div)
    await tick(20)
  })
})
