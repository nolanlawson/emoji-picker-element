import {
  basicAfterEach,
  basicBeforeEach,
  EMOJIBASE_V5, mockDataSourceWithArraySkinTones,
  mockDataSourceWithNoShortcodes,
  mockEmojibaseV5DataSource,
  NO_SHORTCODES,
  tick,
  WITH_ARRAY_SKIN_TONES
} from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { fireEvent, getByRole, waitFor } from '@testing-library/dom'
import { openSkintoneListbox } from './shared'

describe('dataSource test', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('emoji with no shortcodes still work', async () => {
    mockDataSourceWithNoShortcodes()
    const dataSource = NO_SHORTCODES
    const picker = new Picker({ dataSource, locale: 'en-no-shortcodes' })
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // no shortcodes, no title
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('title')).toStrictEqual('')
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('aria-label')).toStrictEqual('😀')

    await picker.database.delete()
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
  })

  test('emoji with emojibase v5 data source still work', async () => {
    mockEmojibaseV5DataSource()
    const dataSource = EMOJIBASE_V5
    const picker = new Picker({ dataSource, locale: 'en-emojibase' })
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

    // no shortcodes, no title
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('title')).toStrictEqual('gleeful')
    expect(getByRole(container, 'menuitem', { name: /😀/ }).getAttribute('aria-label')).toStrictEqual('😀, gleeful')

    await picker.database.delete()
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
  })

  test('emoji with array skin tones work', async () => {
    mockDataSourceWithArraySkinTones()

    const dataSource = WITH_ARRAY_SKIN_TONES
    const picker = new Picker({ dataSource, locale: 'en-arrayskintones' })
    document.body.appendChild(picker)
    const container = picker.shadowRoot.querySelector('.picker')
    await tick(20)

    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())
    await fireEvent.click(getByRole(container, 'tab', { name: /People and body/ }))
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🧑‍🤝‍🧑/ })).toBeVisible())

    await openSkintoneListbox(container)

    await fireEvent.click(getByRole(container, 'option', { name: /Medium-Dark/ }))

    // both people in the emoji should have the same skin tone
    await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🧑🏾‍🤝‍🧑🏾/ })).toBeVisible())

    await picker.database.delete()
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
  })
})
