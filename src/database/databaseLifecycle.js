import { migrations } from './migrations'
import { DB_VERSION_CURRENT, MODE_READONLY } from './constants'
import { mark, stop } from '../shared/marks'

const openReqs = {}
const databaseCache = {}

function createDatabase (dbName) {
  return new Promise((resolve, reject) => {
    mark('createDatabase')
    const req = indexedDB.open(dbName, DB_VERSION_CURRENT)
    openReqs[dbName] = req
    req.onerror = reject
    req.onblocked = () => {
      console.error('idb blocked')
    }
    req.onupgradeneeded = e => {
      const db = req.result
      const tx = e.currentTarget.transaction

      const migrationsToDo = migrations.filter(({ version }) => e.oldVersion < version)

      function doNextMigration () {
        if (!migrationsToDo.length) {
          return
        }
        const { migration } = migrationsToDo.shift()
        migration(db, tx, doNextMigration)
      }
      doNextMigration()
    }
    req.onsuccess = () => {
      stop('createDatabase')
      resolve(req.result)
    }
  })
}

export function openDatabase (dbName) {
  if (!databaseCache[dbName]) {
    databaseCache[dbName] = createDatabase(dbName)
  }
  return databaseCache[dbName]
}

export async function dbPromise (db, storeName, readOnlyOrReadWrite, cb) {
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
    tx.onerror = () => reject(tx.error)
  })
}

export function get (db, storeName, key) {
  return dbPromise(db, storeName, MODE_READONLY, (store, cb) => {
    if (Array.isArray(key)) {
      const res = Array(key.length)
      let todo = 0
      for (let i = 0; i < key.length; i++) {
        store.get(key[i]).onsuccess = e => {
          res[i] = e.target.result
          if (++todo === key.length) {
            cb(res)
          }
        }
      }
    } else {
      store.get(key).onsuccess = e => cb(e.target.result)
    }
  })
}

export function closeDatabase (dbName) {
  // close any open requests
  const openReq = openReqs[dbName]
  if (openReq && openReq.result) {
    openReq.result.close()
  }
  delete openReqs[dbName]
  delete databaseCache[dbName]
}

export function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    // close any open requests
    const openReq = openReqs[dbName]
    if (openReq && openReq.result) {
      openReq.result.close()
    }
    delete openReqs[dbName]
    delete databaseCache[dbName]
    const req = indexedDB.deleteDatabase(dbName)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => console.error(`database ${dbName} blocked`)
  })
}
