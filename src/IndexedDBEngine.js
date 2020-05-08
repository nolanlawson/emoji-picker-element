import { dbPromise, openDatabase } from './databaseLifecycle'
import {
  DATA_VERSION_CURRENT,
  DB_NAME,
  INDEX_GROUP_AND_ORDER,
  KEY_VERSION,
  STORE_EMOJI,
  STORE_META
} from './constants'
import { transformEmojiBaseData } from './transformEmojiBaseData'

export class IndexedDBEngine {
  constructor () {
    this._db = null
    this.readyPromise = openDatabase(DB_NAME).then(db => {
      this._db = db
    })
  }

  async loadData (emojiBaseData) {
    const transformedData = transformEmojiBaseData(emojiBaseData)
    const dataVersion = await dbPromise(this._db, STORE_META, 'readonly', (metaStore, cb) => {
      metaStore.get(KEY_VERSION).onsuccess = e => cb(e.target.result)
    })
    if (dataVersion < DATA_VERSION_CURRENT) {
      await dbPromise(this._db, [STORE_EMOJI, STORE_META], 'readwrite', ([emojiStore, metaStore]) => {
        metaStore.get(KEY_VERSION).onsuccess = e => {
          const dataVersion = e.target.result
          // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
          if (dataVersion < DATA_VERSION_CURRENT) {
            for (const data of transformedData) {
              emojiStore.put(data)
            }
          }
        }
      })
    }
  }

  getEmojiByGroup (group) {
    return dbPromise(this._db, STORE_EMOJI, 'readonly', (emojiStore, cb) => {
      const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true)
      emojiStore.index(INDEX_GROUP_AND_ORDER).getAll(range).onsuccess = e => {
        cb(e.target.result)
      }
    })
  }
}
