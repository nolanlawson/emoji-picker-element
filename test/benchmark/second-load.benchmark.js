import { Database } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { dataSource } from './utils.js'

// populate IndexedDB so the Picker is just reading from the local store
const db = new Database({ dataSource })
await db.ready()
await db.close()

// lazy-load the picker so that its logic to determine emoji support runs during the perf measure
const { Picker } = await import('@nolanlawson/emoji-picker-element-for-tachometer')

document.body.appendChild(new Picker({ dataSource }))
