import {
  FIELD_GROUP, FIELD_ORDER, FIELD_UNICODE,
  FIELD_TOKENS,
  INDEX_GROUP_AND_ORDER,
  STORE_EMOJI,
  STORE_KEYVALUE,
  STORE_FAVORITES,
  INDEX_TOKENS, INDEX_COUNT, INDEX_SKIN_UNICODE, FIELD_SKIN_UNICODE
} from './constants'

export function initialMigration (db) {
  db.createObjectStore(STORE_KEYVALUE)

  const emojiStore = db.createObjectStore(STORE_EMOJI, { keyPath: FIELD_UNICODE })
  emojiStore.createIndex(INDEX_TOKENS, FIELD_TOKENS, { multiEntry: true })
  emojiStore.createIndex(INDEX_GROUP_AND_ORDER, [FIELD_GROUP, FIELD_ORDER])
  emojiStore.createIndex(INDEX_SKIN_UNICODE, FIELD_SKIN_UNICODE, { multiEntry: true })

  const favoritesStore = db.createObjectStore(STORE_FAVORITES)
  favoritesStore.createIndex(INDEX_COUNT, '')
}
