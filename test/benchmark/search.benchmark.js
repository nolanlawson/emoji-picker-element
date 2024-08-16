import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { waitForElementWithId, postRaf, dataSource } from './utils.js'

const picker = new Picker({ dataSource })
document.body.appendChild(picker)

await waitForElementWithId(picker.shadowRoot, 'emo-🥰')
await postRaf()
const searchBox = picker.shadowRoot.querySelector('[role="combobox"]')

performance.mark('start-search')
searchBox.value = 'fa' // "face" returns a lot of results, we want a non-trivial benchmark
searchBox.dispatchEvent(new Event('input', { bubbles: true }))

await waitForElementWithId(picker.shadowRoot, 'emo-🐻')
await postRaf()
performance.measure('benchmark-total', 'start-search')
