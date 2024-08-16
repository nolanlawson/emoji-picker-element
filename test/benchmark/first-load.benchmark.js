import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { dataSource, postRaf, waitForElementWithId } from './utils.js'

performance.mark('benchmark-start')
const picker = new Picker({ dataSource })
document.body.appendChild(picker)
await waitForElementWithId(picker.shadowRoot, 'emo-🥰')
await postRaf()
performance.measure('benchmark-total', 'benchmark-start')
