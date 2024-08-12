import Picker from '../../../src/picker/PickerElement'
import { ALL_EMOJI, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'
import { setSimulateBrowserNotSupportingZWJEmoji } from '../../../src/picker/utils/checkZwjSupport.js'
import { supportedZwjEmojis } from '../../../src/picker/utils/emojiSupport.js'
import { getAllByRole, getByRole, queryAllByRole, waitFor } from '@testing-library/dom'
import { groups } from '../../../src/picker/groups.js'

describe('ZWJ emoji', () => {
  const simulations = [false, true]

  simulations.forEach(simulateBrowserNotSupportingZWJ => {
    describe(`simulateBrowserNotSupportingZWJ=${simulateBrowserNotSupportingZWJ}`, () => {
      beforeEach(async () => {
        await basicBeforeEach()
        setSimulateBrowserNotSupportingZWJEmoji(simulateBrowserNotSupportingZWJ)
      })
      afterEach(async () => {
        await basicAfterEach()
        setSimulateBrowserNotSupportingZWJEmoji(false)
        supportedZwjEmojis.clear() // reset global cache after each test
      })

      test('shows or hides ZWJ emoji appropriately', async () => {
        console.log(truncatedEmoji)
        const picker = new Picker({
          dataSource: ALL_EMOJI
        })

        document.body.appendChild(picker)

        const container = picker.shadowRoot.querySelector('.picker')

        await waitFor(() => expect(getAllByRole(container, 'tab')).toHaveLength(groups.length))

        getByRole(container, 'tab', { name: 'Flags' }).click()

        // checkered flag is shown because it's not ZWJ, should always be shown
        await waitFor(() => expect(getByRole(container, 'menuitem', { name: /🏁/ })).toBeVisible())
        // pirate flag is a ZWJ combining black flag plus skull and crossbones, should be hidden if no browser support
        await waitFor(() => expect(queryAllByRole(container, 'menuitem', { name: /🏴‍☠️/ })).toHaveLength(simulateBrowserNotSupportingZWJ ? 0 : 1))
      })
    })
  })
})
