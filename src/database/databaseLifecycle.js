import { migrations } from './migrations'
import { mark, stop } from '../shared/marks'

const openReqs = {}
const databaseCache = {}
const onCloseListeners = {}

function handleOpenOrDeleteReq (resolve, reject, req) {
  // These things are almost impossible to test with fakeIndexedDB sadly
  /* istanbul ignore next */
  req.onerror = () => reject(req.error)
  /* istanbul ignore next */
  req.onblocked = () => reject(new Error('IDB blocked'))
  req.onsuccess = () => resolve(req.result)
}

async function createDatabase (dbName) {
  mark('createDatabase')
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, migrations.length)
    openReqs[dbName] = req
    req.onupgradeneeded = e => {
      const db = req.result
      const txn = req.transaction
      for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i]
        /* istanbul ignore else */
        if (e.oldVersion < i + 1) {
          migration(db, txn)
        }
      }
    }
    handleOpenOrDeleteReq(resolve, reject, req)
  })
  // Handle abnormal closes, e.g. "delete database" in chrome dev tools.
  // No need for removeEventListener, because once the DB can no longer
  // fire "close" events, it will auto-GC.
  // Unfortunately cannot test in fakeIndexedDB: https://github.com/dumbmatter/fakeIndexedDB/issues/50
  /* istanbul ignore next */
  db.onclose = () => closeDatabase(dbName)
  stop('createDatabase')
  return db
}

export function openDatabase (dbName) {
  if (!databaseCache[dbName]) {
    databaseCache[dbName] = createDatabase(dbName)
  }
  return databaseCache[dbName]
}

export function dbPromise (db, storeName, readOnlyOrReadWrite, cb) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, readOnlyOrReadWrite)
    const store = typeof storeName === 'string'
      ? tx.objectStore(storeName)
      : storeName.map(name => tx.objectStore(name))
    let res
    cb(store, (result) => {
      res = result
    })

    tx.oncomplete = () => resolve(res)
    /* istanbul ignore next */
    tx.onerror = () => reject(tx.error)
  })
}

export function closeDatabase (dbName) {
  // close any open requests
  const req = openReqs[dbName]
  const db = req && req.result
  if (db) {
    db.close()
    const listeners = onCloseListeners[dbName]
    /* istanbul ignore else */
    if (listeners) {
      for (const listener of listeners) {
        listener()
      }
    }
  }
  delete openReqs[dbName]
  delete databaseCache[dbName]
  delete onCloseListeners[dbName]
}

export function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    // close any open requests
    closeDatabase(dbName)
    const req = indexedDB.deleteDatabase(dbName)
    handleOpenOrDeleteReq(resolve, reject, req)
  })
}

// The "close" event occurs during an abnormal shutdown, e.g. a user clearing their browser data.
// However, it doesn't occur with the normal "close" event, so we handle that separately.
// https://www.w3.org/TR/IndexedDB/#close-a-database-connection
export function addOnCloseListener (dbName, listener) {
  let listeners = onCloseListeners[dbName]
  if (!listeners) {
    listeners = onCloseListeners[dbName] = []
  }
  listeners.push(listener)
}
