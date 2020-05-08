import {
  DATA_VERSION_INITIAL, DB_VERSION_INITIAL,
  FIELD_GROUP, FIELD_ORDER, FIELD_UNICODE,
  FIELD_TOKENS,
  INDEX_GROUP_AND_ORDER,
  KEY_VERSION,
  STORE_EMOJI,
  STORE_META
} from './constants'

function initialMigration (db, tx, done) {
  function createObjectStore (name, init, indexes) {
    const store = init
      ? db.createObjectStore(name, init)
      : db.createObjectStore(name)
    if (indexes) {
      Object.keys(indexes).forEach(indexKey => {
        store.createIndex(indexKey, indexes[indexKey])
      })
    }
    return store
  }

  const metaStore = createObjectStore(STORE_META)
  metaStore.put(DATA_VERSION_INITIAL, KEY_VERSION)
  createObjectStore(STORE_EMOJI, { keyPath: FIELD_UNICODE }, {
    [FIELD_TOKENS]: FIELD_TOKENS,
    [INDEX_GROUP_AND_ORDER]: [FIELD_GROUP, FIELD_ORDER]
  })
  done()
}

export const migrations = [
  {
    version: DB_VERSION_INITIAL,
    migration: initialMigration
  }
]
