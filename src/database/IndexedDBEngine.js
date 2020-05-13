import { closeDatabase, dbPromise, deleteDatabase, get, openDatabase } from './databaseLifecycle'
import {
  DATA_VERSION_CURRENT,
  INDEX_GROUP_AND_ORDER, INDEX_TOKENS, KEY_ETAG,
  KEY_VERSION, MODE_READONLY, MODE_READWRITE,
  STORE_EMOJI,
  STORE_META
} from './constants'
import { transformEmojiBaseData } from './transformEmojiBaseData'

export class IndexedDBEngine {
  constructor (dbName) {
    this._db = null
    this._dbName = dbName
  }

  async open () {
    this._db = await openDatabase(this._dbName)
  }

  async loadData (emojiBaseData, etag) {
    const transformedData = transformEmojiBaseData(emojiBaseData)
    const existingEtag = await get(this._db, STORE_META, KEY_ETAG)
    if (existingEtag === etag) {
      return
    }
    await dbPromise(this._db, [STORE_EMOJI, STORE_META], MODE_READWRITE, ([emojiStore, metaStore]) => {

      let existingEtag
      let gotEtag = false
      let existingKeys

      function checkHasEtagAndKeys () {
        if (gotEtag && existingKeys) {
          onGetEtagAndKeys()
        }
      }

      function onGetEtagAndKeys () {
        if (existingEtag === etag) {
          // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
          return
        }
        if (existingKeys.length) {
          for (const key of existingKeys) {
            emojiStore.delete(key)
          }
        }
        insertData()
      }

      function insertData () {
        for (const data of transformedData) {
          emojiStore.put(data)
        }
      }

      metaStore.get(KEY_ETAG).onsuccess = e => {
        existingEtag = e.target.result
        gotEtag = true
        checkHasEtagAndKeys()
      }

      emojiStore.getAllKeys().onsuccess = e => {
        existingKeys = e.target.result
        checkHasEtagAndKeys()
      }
    })

  }

  getEmojiByGroup (group) {
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true)
      emojiStore.index(INDEX_GROUP_AND_ORDER).getAll(range).onsuccess = e => {
        cb(e.target.result)
      }
    })
  }

  getEmojiBySearchPrefix (prefix) {
    prefix = prefix.toLowerCase()
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      const range = IDBKeyRange.bound(prefix, prefix + '\uffff', false, true)
      emojiStore.index(INDEX_TOKENS).getAll(range).onsuccess = e => {
        cb(e.target.result)
      }
    })
  }

  getEmojiByShortcode (shortcode) {
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

  getEmojiByUnicode (unicode) {
    return dbPromise(this._db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
      emojiStore.get(unicode).onsuccess = e => cb(e.target.result)
    })
  }

  async close () {
    await closeDatabase(this._dbName)
    this._db = null
  }

  async delete () {
    await deleteDatabase(this._dbName)
    this._db = null
  }
}
