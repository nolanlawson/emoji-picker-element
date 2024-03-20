import { initialMigration } from './migrations'
import { DB_VERSION_INITIAL, DB_VERSION_CURRENT } from './constants'

export const openIndexedDBs = []
const onCloseListeners = new WeakMap()

function handleOpenOrDeleteReq (resolve, reject, req) {
  // These things are almost impossible to test with fakeIndexedDB sadly
  /* istanbul ignore next */
  req.onerror = () => reject(req.error)
  /* istanbul ignore next */
  req.onblocked = () => reject(new Error('IDB blocked'))
  req.onsuccess = () => resolve(req.result)
}

export async function openDatabase (dbName) {
  performance.mark('openDatabase')
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION_CURRENT)

    req.onupgradeneeded = e => {
      // Technically there is only one version, so we don't need this `if` check
      // But if an old version of the JS is in another browser tab
      // and it gets upgraded in the future and we have a new DB version, well...
      // better safe than sorry.
      /* istanbul ignore else */
      if (e.oldVersion < DB_VERSION_INITIAL) {
        initialMigration(req.result)
      }
    }
    handleOpenOrDeleteReq(resolve, reject, req)
  })
  if (import.meta.env.MODE === 'test') {
    openIndexedDBs.push(db)
  }
  // Handle abnormal closes, e.g. "delete database" in chrome dev tools.
  // No need for removeEventListener, because once the DB can no longer
  // fire "close" events, it will auto-GC.
  // Unfortunately cannot test in fakeIndexedDB: https://github.com/dumbmatter/fakeIndexedDB/issues/50
  /* istanbul ignore next */
  db.onclose = () => closeDatabase(dbName)
  performance.measure('openDatabase', 'openDatabase')
  return db
}

export function dbPromise (db, storeName, readOnlyOrReadWrite, cb) {
  return new Promise((resolve, reject) => {
    // Use relaxed durability because neither the emoji data nor the favorites/preferred skin tone
    // are really irreplaceable data. IndexedDB is just a cache in this case.
    const txn = db.transaction(storeName, readOnlyOrReadWrite, { durability: 'relaxed' })
    const store = typeof storeName === 'string'
      ? txn.objectStore(storeName)
      : storeName.map(name => txn.objectStore(name))
    let res
    cb(store, txn, (result) => {
      res = result
    })

    txn.oncomplete = () => resolve(res)
    /* istanbul ignore next */
    txn.onerror = () => reject(txn.error)
  })
}

export function closeDatabase (db) {
  db.close()
  const listener = onCloseListeners.get(db)
  if (listener) {
    listener()
  }
  onCloseListeners.delete(db)
  if (import.meta.env.MODE === 'test') {
    openIndexedDBs.splice(openIndexedDBs.indexOf(db), 1)
  }
}

export function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    // close any open requests
    const req = indexedDB.deleteDatabase(dbName)
    handleOpenOrDeleteReq(resolve, reject, req)
  })
}

// The "close" event occurs during an abnormal shutdown, e.g. a user clearing their browser data.
// However, it doesn't occur with the normal "close" event, so we handle that separately.
// https://www.w3.org/TR/IndexedDB/#close-a-database-connection
export function setOnCloseListener (db, listener) {
  onCloseListeners.set(db, listener)
}
