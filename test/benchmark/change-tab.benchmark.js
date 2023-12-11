import Picker from './picker.js'
import { waitForElementWithId, postRaf } from './utils.js'

const picker = new Picker()
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-😀')
await postRaf()
const peopleTabButton = picker.shadowRoot.querySelector('[role="tab"][aria-label="People and body"]')

performance.mark('start-change-tab')
peopleTabButton.click()

await waitForElementWithId(picker.shadowRoot, 'emo-👋')
await postRaf()
performance.measure('benchmark-total', 'start-change-tab')
