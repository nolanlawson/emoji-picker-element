import { dbPromise, openDatabase } from './databaseLifecycle'
import {
  DATA_VERSION_CURRENT,
  DB_NAME,
  INDEX_GROUP_AND_ORDER, INDEX_TOKENS,
  KEY_VERSION, MODE_READONLY, MODE_READWRITE,
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
    const dataVersion = await dbPromise(this._db, STORE_META, MODE_READONLY, (metaStore, cb) => {
      metaStore.get(KEY_VERSION).onsuccess = e => cb(e.target.result)
    })
    if (dataVersion < DATA_VERSION_CURRENT) {
      await dbPromise(this._db, [STORE_EMOJI, STORE_META], MODE_READWRITE, ([emojiStore, metaStore]) => {
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
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true)
      emojiStore.index(INDEX_GROUP_AND_ORDER).getAll(range).onsuccess = e => {
        cb(e.target.result)
      }
    })
  }

  getEmojiBySearchPrefix(prefix) {
    prefix = prefix.toLowerCase()
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      const range = IDBKeyRange.bound(prefix, prefix + '\uffff', false, true)
      emojiStore.index(INDEX_TOKENS).getAll(range).onsuccess = e => {
        cb(e.target.result)
      }
    })
  }

  getEmojiByShortcode(shortcode) {
    shortcode = shortcode.toLowerCase()
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      const range = IDBKeyRange.only(shortcode)
      emojiStore.index(INDEX_TOKENS).getAll(range).onsuccess = e => {
        // of course, we could add an extra index just for shortcodes, but it seems
        // simpler to just re-use the existing tokens index and filter in-memory
        const results = e.target.result.filter(emoji => emoji.shortcodes.includes(shortcode))
        cb(results[0])
      }
    })
  }

  getEmojiByUnicode(unicode) {
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      emojiStore.get(unicode).onsuccess = e => cb(e.target.result)
    })
  }
}
