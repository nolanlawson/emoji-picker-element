import { basicBeforeEach, basicAfterEach, ALL_EMOJI, truncatedEmoji, tick } from '../shared'
import * as testingLibrary from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'
import userEvent from '@testing-library/user-event'
import Database from '../../../src/database/Database'
import { requestAnimationFrame } from '../../../src/picker/utils/requestAnimationFrame.js'

const { waitFor } = testingLibrary
const { click } = userEvent

describe('Race conditions', () => {
  let picker
  let container

  const proxy = new Proxy(testingLibrary, {
    get (obj, prop) {
      return function (...args) {
        return obj[prop](container, ...args)
      }
    }
  })
  const { getByRole } = proxy

  const numInGroup1 = truncatedEmoji.filter(_ => _.group === 0).length

  beforeEach(async () => {
    basicBeforeEach()
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')
    await tick(20)
    await waitFor(() => expect(
      testingLibrary.getAllByRole(getByRole('tabpanel'), 'menuitem')).toHaveLength(numInGroup1),
    { timeout: 2000 }
    )
    await tick(20)
  })
  afterEach(async () => {
    await tick(20)
    picker.remove()
    await tick(20)
    await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
    await tick(20)
    await basicAfterEach()
  })

  test('Immediately remove and re-add a new picker element', async () => {
    picker.remove()
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
  })

  test('Immediately remove and re-add a new picker element - tick between each', async () => {
    for (let i = 0; i < 2; i++) {
      picker.remove()
      await tick(i)
      picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
      document.body.appendChild(picker)
    }
  })

  test('Click tab and then immediately remove picker with various timings', async () => {
    const delays = [
      undefined,
      () => new Promise(requestAnimationFrame),
      () => tick(0),
      () => tick(1),
      () => tick(2)
    ]
    for (const delay of delays) {
      /* no await */ click(getByRole('tab', { name: 'Animals and nature' }))
      if (delay) {
        await delay()
      }
      // remove
      picker.remove()
      // recreate
      picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
      document.body.appendChild(picker)
      container = picker.shadowRoot.querySelector('.picker')
    }
  })
})
