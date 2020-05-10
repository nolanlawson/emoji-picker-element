import { migrations } from './migrations'
import { DB_VERSION_CURRENT } from './constants'

const openReqs = {}
const databaseCache = {}

function createDatabase (instanceName) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(instanceName, DB_VERSION_CURRENT)
    openReqs[instanceName] = req
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
    req.onsuccess = () => resolve(req.result)
  })
}

export async function openDatabase (dbName) {
  if (!dbName) {
    throw new Error('dbName is required')
  }
  if (!databaseCache[dbName]) {
    databaseCache[dbName] = await createDatabase(dbName)
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

export function closeDatabase (dbName) {
  if (!dbName) {
    throw new Error('dbName is required')
  }
  // close any open requests
  const openReq = openReqs[dbName]
  if (openReq && openReq.result) {
    openReq.result.close()
  }
  delete openReqs[dbName]
  delete databaseCache[dbName]
}
