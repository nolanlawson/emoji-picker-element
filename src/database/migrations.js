import {
  DATA_VERSION_INITIAL, DB_VERSION_INITIAL,
  FIELD_GROUP, FIELD_ORDER, FIELD_UNICODE,
  FIELD_TOKENS,
  INDEX_GROUP_AND_ORDER,
  KEY_VERSION,
  STORE_EMOJI,
  STORE_META, INDEX_TOKENS
} from './constants'

function initialMigration (db, tx, done) {
  function createObjectStore (name, init, indexes) {
    const store = init
      ? db.createObjectStore(name, init)
      : db.createObjectStore(name)
    if (indexes) {
      for (const { indexName, keyPath, multiEntry } of indexes) {
        store.createIndex(indexName, keyPath, { multiEntry })
      }
    }
    return store
  }

  const metaStore = createObjectStore(STORE_META)
  metaStore.put(DATA_VERSION_INITIAL, KEY_VERSION)
  createObjectStore(STORE_EMOJI, { keyPath: FIELD_UNICODE }, [
    { indexName: INDEX_TOKENS, keyPath: FIELD_TOKENS, multiEntry: true },
    { indexName: INDEX_GROUP_AND_ORDER, keyPath: [FIELD_GROUP, FIELD_ORDER] }
  ])
  done()
}

export const migrations = [
  {
    version: DB_VERSION_INITIAL,
    migration: initialMigration
  }
]
