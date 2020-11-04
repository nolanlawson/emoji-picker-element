import { mockDataSourceWithNoShortcodes, NO_SHORTCODES, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getByRole, waitFor } from '@testing-library/dom'

describe('shortcodes test', () => {
  test('emoji with no shortcodes still work', async () => {
    mockDataSourceWithNoShortcodes()
    const dataSource = NO_SHORTCODES
    const picker = new Picker({ dataSource })
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // no shortcodes, no title
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('title')).toStrictEqual('')
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('aria-label')).toStrictEqual('😀')

    await picker.database.delete()
    await tick(20)
  })
})
