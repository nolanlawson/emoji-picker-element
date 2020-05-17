import { closeDatabase, dbPromise, deleteDatabase, get, openDatabase } from './databaseLifecycle'
import {
  INDEX_GROUP_AND_ORDER, INDEX_TOKENS, KEY_ETAG, KEY_URL,
  MODE_READONLY, MODE_READWRITE,
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

  async isEmpty () {
    return !(await get(this._db, STORE_META, KEY_URL))
  }

  async hasData (url, eTag) {
    const [oldETag, oldUrl] = await get(this._db, STORE_META, [KEY_ETAG, KEY_URL])
    return (oldETag === eTag && oldUrl === url)
  }

  async loadData (emojiBaseData, url, eTag) {
    const transformedData = transformEmojiBaseData(emojiBaseData)
    const [oldETag, oldUrl] = await get(this._db, STORE_META, [KEY_ETAG, KEY_URL])
    if (oldETag === eTag && oldUrl === url) {
      return
    }
    await dbPromise(this._db, [STORE_EMOJI, STORE_META], MODE_READWRITE, ([emojiStore, metaStore]) => {
      let oldETag
      let oldUrl
      let oldKeys
      let todo = 0

      function checkFetched () {
        if (++todo === 3) {
          onFetched()
        }
      }

      function onFetched () {
        if (oldETag === eTag && oldUrl === url) {
          // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
          return
        }
        if (oldKeys.length) {
          for (const key of oldKeys) {
            emojiStore.delete(key)
          }
        }
        insertData()
      }

      function insertData () {
        for (const data of transformedData) {
          emojiStore.put(data)
        }
        metaStore.put(eTag, KEY_ETAG)
        metaStore.put(url, KEY_URL)
      }

      metaStore.get(KEY_ETAG).onsuccess = e => {
        oldETag = e.target.result
        checkFetched()
      }

      metaStore.get(KEY_URL).onsuccess = e => {
        oldUrl = e.target.result
        checkFetched()
      }

      emojiStore.getAllKeys().onsuccess = e => {
        oldKeys = e.target.result
        checkFetched()
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
