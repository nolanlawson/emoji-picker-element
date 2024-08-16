import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { waitForElementWithId, postRaf, dataSource } from './utils.js'

const picker = new Picker({ dataSource })
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-🥰')
await postRaf()
const peopleTabButton = picker.shadowRoot.querySelector('[role="tab"][aria-label="People and body"]')

performance.mark('start-change-tab')
peopleTabButton.click()

await waitForElementWithId(picker.shadowRoot, 'emo-👋')
await postRaf()
performance.measure('benchmark-total', 'start-change-tab')
