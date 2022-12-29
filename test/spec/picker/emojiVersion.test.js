import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick } from '../shared.js'
import Picker from '../../../src/picker/PickerElement.js'
import * as testingLibrary from '@testing-library/dom'
import { getByRole, waitFor } from '@testing-library/dom'
import Database from '../../../src/database/Database.js'

describe('Picker custom emojiVersion tests', () => {
  let picker

  beforeEach(async () => {
    await basicBeforeEach()
  })

  afterEach(async () => {
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
    await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
    await tick(20)
    await basicAfterEach()
  })

  test('can use the emojiVersion property', async () => {
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en', emojiVersion: '10.0' })
    document.body.appendChild(picker)

    await waitFor(() => expect(
      // Normally this would be 20, but because we set the emoji version to 10.0, the 🥰 is excluded
      testingLibrary.getAllByRole(getByRole(picker.shadowRoot, 'tabpanel'), 'menuitem')).toHaveLength(19),
    { timeout: 2000 }
    )
  })

  test('can use the emoji-version attribute', async () => {
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    picker.setAttribute('emoji-version', '10.0')
    document.body.appendChild(picker)

    await waitFor(() => expect(
      // Normally this would be 20, but because we set the emoji version to 10.0, the 🥰 is excluded
      testingLibrary.getAllByRole(getByRole(picker.shadowRoot, 'tabpanel'), 'menuitem')).toHaveLength(19),
    { timeout: 2000 }
    )
  })
})
