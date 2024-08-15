import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { waitForElementWithId, postRaf, waitForPickerInitialLoad, dataSource } from './utils.js'

const picker = new Picker({ dataSource })
document.body.appendChild(picker)

await waitForPickerInitialLoad()
await postRaf()
const peopleTabButton = picker.shadowRoot.querySelector('[role="tab"][aria-label="People and body"]')

performance.mark('start-change-tab')
peopleTabButton.click()

await waitForElementWithId(picker.shadowRoot, 'emo-👋')
await postRaf()
performance.measure('benchmark-total', 'start-change-tab')
