import { EMOJIBASE_V5, mockDataSourceWithNoShortcodes, mockEmojibaseV5DataSource, NO_SHORTCODES, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getByRole, waitFor } from '@testing-library/dom'

describe('dataSource test', () => {
  test('emoji with no shortcodes still work', async () => {
    mockDataSourceWithNoShortcodes()
    const dataSource = NO_SHORTCODES
    const picker = new Picker({ dataSource, locale: 'en-no-shortcodes' })
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // no shortcodes, no title
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('title')).toStrictEqual('')
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('aria-label')).toStrictEqual('😀')

    await picker.database.delete()
    await tick(20)
  })

  test('emoji with emojibase v5 data source still work', async () => {
    mockEmojibaseV5DataSource()
    const dataSource = EMOJIBASE_V5
    const picker = new Picker({ dataSource, locale: 'en-emojibase' })
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // no shortcodes, no title
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('title')).toStrictEqual('gleeful')
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('aria-label')).toStrictEqual('😀, gleeful')

    await picker.database.delete()
    await tick(20)
  })
})
