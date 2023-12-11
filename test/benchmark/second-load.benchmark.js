import Database from './database.js'

const dataSource = './data.json'

// populate IndexedDB so the Picker is just reading from the local store
const db = new Database({ dataSource })
await db.ready()
await db.close()

// lazy-load the picker so that its logic to determine emoji support runs during the perf measure
const { default: Picker } = await import('../../picker.js')

document.body.appendChild(new Picker({ dataSource }))
