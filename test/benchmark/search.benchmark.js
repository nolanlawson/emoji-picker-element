import Picker from './picker.js'
import { raf, waitForElementWithId, postRaf } from './utils.js'

const picker = new Picker()
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-😀')
await raf()
const searchBox = picker.shadowRoot.querySelector('[role="combobox"]')

performance.mark('start-search')
searchBox.value = 'heart'
searchBox.dispatchEvent(new Event('input', { bubbles: true }))

await waitForElementWithId(picker.shadowRoot, 'emo-♥️')
await postRaf()
performance.measure('benchmark-total', 'start-search')