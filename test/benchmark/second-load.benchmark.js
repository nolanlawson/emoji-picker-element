import { Database } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { dataSource, postRaf, waitForElementWithId } from './utils.js'

// populate IndexedDB so the Picker is just reading from the local store
const db = new Database({ dataSource })
await db.ready()
await db.close()

// lazy-load the picker so that its logic to determine emoji support runs during the perf measure
const { Picker } = await import('@nolanlawson/emoji-picker-element-for-tachometer')

performance.mark('benchmark-start')
const picker = new Picker({ dataSource })
document.body.appendChild(picker)
await waitForElementWithId(picker.shadowRoot, 'emo-🥰')
await postRaf()
performance.measure('benchmark-total', 'benchmark-start')
