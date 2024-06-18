import { groups } from '../../../src/picker/groups'
import * as testingLibrary from '@testing-library/dom'
import {
  waitFor, getAllByRole,
  getByRole, fireEvent
} from '@testing-library/dom'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, tick, truncatedEmoji } from '../shared'
import Picker from '../../../src/picker/PickerElement'
import Database from '../../../src/database/Database'
import { resetResizeObserverSupported } from '../../../src/picker/utils/resizeListener.js'

// TODO: we can remove these tests when/if we stop supporting browsers without ResizeObserver
// https://caniuse.com/resizeobserver

describe('ResizeObserver unsupported', () => {
  let picker
  let container
  let oldResizeObserver

  beforeEach(async () => {
    basicBeforeEach()

    oldResizeObserver = global.ResizeObserver
    delete global.ResizeObserver
    resetResizeObserverSupported()

    picker = new Picker({ dataSource: ALL_EMOJI })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')
    await tick(40)
  })

  afterEach(async () => {
    await tick(40)
    document.body.removeChild(picker)
    await tick(40)
    await new Database({ dataSource: ALL_EMOJI }).delete()
    await tick(40)
    await basicAfterEach()

    global.ResizeObserver = oldResizeObserver
    resetResizeObserverSupported()
  })

  test('basic picker test', async () => {
    const numInGroup1 = truncatedEmoji.filter(_ => _.group === 0).length
    const numInGroup2 = truncatedEmoji.filter(_ => _.group === 1).length

    await waitFor(() => expect(getByRole(container, 'button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible())
    expect(getAllByRole(container, 'tab')).toHaveLength(groups.length)

    expect(getByRole(container, 'tab', { name: 'Smileys and emoticons', selected: true })).toBeVisible()
    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole(container, 'tabpanel'), 'menuitem')).toHaveLength(numInGroup1)
    )

    expect(getByRole(container, 'tab', { name: 'People and body' })).toBeVisible()
    fireEvent.click(getByRole(container, 'tab', { name: 'People and body' }))

    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole(container, 'tabpanel'), 'menuitem')).toHaveLength(numInGroup2))

    await waitFor(() => expect(getByRole(container, 'tab', { name: 'People and body', selected: true })).toBeVisible())
  })
})
