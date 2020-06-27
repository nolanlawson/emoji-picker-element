import {
  DB_VERSION_INITIAL,
  FIELD_GROUP, FIELD_ORDER, FIELD_UNICODE,
  FIELD_TOKENS,
  INDEX_GROUP_AND_ORDER,
  STORE_EMOJI,
  STORE_KEYVALUE,
  STORE_FAVORITES,
  INDEX_TOKENS, INDEX_COUNT, INDEX_SKIN_UNICODE, FIELD_SKIN_UNICODE
} from './constants'

function initialMigration (db, tx, done) {
  function createObjectStore (name, keyPath, indexes) {
    const store = keyPath
      ? db.createObjectStore(name, { keyPath })
      : db.createObjectStore(name)
    if (indexes) {
      for (const [indexName, [keyPath, multiEntry]] of Object.entries(indexes)) {
        store.createIndex(indexName, keyPath, { multiEntry })
      }
    }
    return store
  }

  createObjectStore(STORE_KEYVALUE)
  createObjectStore(STORE_EMOJI, /* keyPath */ FIELD_UNICODE, {
    [INDEX_TOKENS]: [FIELD_TOKENS, /* multiEntry */ true],
    [INDEX_GROUP_AND_ORDER]: [[FIELD_GROUP, FIELD_ORDER]],
    [INDEX_SKIN_UNICODE]: [FIELD_SKIN_UNICODE, /* multiEntry */ true]
  })
  createObjectStore(STORE_FAVORITES, undefined, {
    [INDEX_COUNT]: ['']
  })
  done()
}

export const migrations = [
  {
    version: DB_VERSION_INITIAL,
    migration: initialMigration
  }
]
