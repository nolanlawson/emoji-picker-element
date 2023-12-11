import Picker from './picker.js'
import { waitForElementWithId, postRaf, waitForPickerInitialLoad } from './utils.js'

const picker = new Picker()
document.body.appendChild(picker)

await waitForPickerInitialLoad()
await postRaf()
const searchBox = picker.shadowRoot.querySelector('[role="combobox"]')

performance.mark('start-search')
searchBox.value = 'fa' // "face" returns a lot of results, we want a non-trivial benchmark
searchBox.dispatchEvent(new Event('input', { bubbles: true }))

await waitForElementWithId(picker.shadowRoot, 'emo-🐻')
await postRaf()
performance.measure('benchmark-total', 'start-search')
