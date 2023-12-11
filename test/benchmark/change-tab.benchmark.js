import Picker from './picker.js'
import { raf, waitForElementWithId, postRaf } from './utils.js'

const picker = new Picker()
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-😀')
await raf()
const peopleTabButton = picker.shadowRoot.querySelector('[role="tab"][aria-label="People and body"]')

performance.mark('start-change-tab')
peopleTabButton.click()

await waitForElementWithId(picker.shadowRoot, 'emo-👋')
await postRaf()
performance.measure('benchmark-total', 'start-change-tab')
