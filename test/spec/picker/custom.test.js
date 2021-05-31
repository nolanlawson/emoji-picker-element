import { ALL_EMOJI, basicBeforeEach, tick } from '../shared'
import { groups } from '../../../src/picker/groups'
import Picker from '../../../src/picker/PickerElement'
import { getAllByRole, getByRole, waitFor } from '@testing-library/dom'

describe('Custom emojis tests', () => {
  beforeEach(basicBeforeEach)

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

    document.body.removeChild(picker)
    await tick(20)
  })
})
