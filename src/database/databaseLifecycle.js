import { migrations } from './migrations'
import { DB_VERSION_CURRENT } from './constants'
import { mark, stop } from '../shared/marks'

const openReqs = {}
const databaseCache = {}

function handleOpenOrDeleteReq (resolve, reject, req) {
  req.onerror = () => reject(req.error)
  req.onblocked = () => reject(new Error('IDB blocked'))
  req.onsuccess = () => resolve(req.result)
}

async function createDatabase (dbName) {
  mark('createDatabase')
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION_CURRENT)
    openReqs[dbName] = req
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
    handleOpenOrDeleteReq(resolve, reject, req)
  })
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
    tx.onerror = () => reject(tx.error)
  })
}

export function closeDatabase (dbName) {
  // close any open requests
  const req = openReqs[dbName]
  const result = req && req.result
  if (result) {
    result.close()
  }
  delete openReqs[dbName]
  delete databaseCache[dbName]
}

export function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    // close any open requests
    closeDatabase(dbName)
    const req = indexedDB.deleteDatabase(dbName)
    handleOpenOrDeleteReq(resolve, reject, req)
  })
}
