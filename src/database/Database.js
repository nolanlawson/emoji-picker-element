import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { assertNumber } from './utils/assertNumber'
import {
  DEFAULT_DATA_SOURCE,
  DEFAULT_LOCALE,
  KEY_PREFERRED_SKINTONE,
  STORE_KEYVALUE
} from './constants'
import { uniqEmoji } from './utils/uniqEmoji'
import {
  closeDatabase,
  deleteDatabase,
  addOnCloseListener,
  openDatabase
} from './databaseLifecycle'
import {
  isEmpty, getEmojiByGroup,
  getEmojiBySearchQuery, getEmojiByShortcode, getEmojiByUnicode,
  get, set, getTopFavoriteEmoji, incrementFavoriteEmojiCount
} from './idbInterface'
import { customEmojiIndex } from './customEmojiIndex'
import { cleanEmoji } from './utils/cleanEmoji'
import { loadDataForFirstTime, checkForUpdates } from './dataLoading'

const init = async database => {
  const db = database._db = await openDatabase(database._dbName)

  addOnCloseListener(database._dbName, () => clear(database))
  const dataSource = database.dataSource
  const empty = await isEmpty(db)

  if (empty) {
    await loadDataForFirstTime(db, dataSource)
  } else { // offline-first - do an update asynchronously
    database._lazyUpdate = checkForUpdates(db, dataSource)
  }
}

const checkReady = async database => {
  if (!database._ready) {
    database._ready = init(database)
  }
  return database._ready
}

// clear references to IDB, e.g. during a close event
const clear = database => {
  console.log('clear database', database._dbName)
  // We don't need to call removeEventListener or remove the manual "close" listeners.
  // The memory leak tests prove this is unnecessary. It's because:
  // 1) IDBDatabases that can no longer fire "close" automatically have listeners GCed
  // 2) we clear the manual close listeners in databaseLifecycle.js.
  database._db = database._ready = database._lazyUpdate = undefined
}

const shutdown = async database => {
  await database.ready() // reopen if we've already been closed/deleted
  try {
    await database._lazyUpdate // allow any lazy updates to process before closing/deleting
  } catch (err) { /* ignore network errors (offline-first) */ }
}

export default class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this.dataSource = dataSource
    this.locale = locale
    this._dbName = `emoji-picker-element-${this.locale}`
    this._db = undefined
    this._lazyUpdate = undefined
    this._custom = customEmojiIndex(customEmoji)
    this._ready = init(this)
  }

  async ready () {
    await checkReady(this)
    // There's a possibility of a race condition where the element gets added, removed, and then added again
    // with a particular timing, which would set the _db to undefined.
    // We *could* do a while loop here, but that seems excessive and could lead to an infinite loop.
    if (!this._db) {
      await checkReady(this)
    }
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    await this.ready()
    return uniqEmoji(await getEmojiByGroup(this._db, group)).map(cleanEmoji)
  }

  async getEmojiBySearchQuery (query) {
    assertNonEmptyString(query)
    await this.ready()
    const customs = this._custom.search(query)
    const natives = uniqEmoji(await getEmojiBySearchQuery(this._db, query)).map(cleanEmoji)
    return [
      ...customs,
      ...natives
    ]
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    await this.ready()
    const custom = this._custom.byShortcode(shortcode)
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByShortcode(this._db, shortcode))
  }

  async getEmojiByUnicodeOrName (unicodeOrName) {
    assertNonEmptyString(unicodeOrName)
    await this.ready()
    const custom = this._custom.byName(unicodeOrName)
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByUnicode(this._db, unicodeOrName))
  }

  async getPreferredSkinTone () {
    await this.ready()
    return (await get(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE)) || 0
  }

  async setPreferredSkinTone (skinTone) {
    assertNumber(skinTone)
    await this.ready()
    return set(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE, skinTone)
  }

  async incrementFavoriteEmojiCount (unicodeOrName) {
    assertNonEmptyString(unicodeOrName)
    await this.ready()
    return incrementFavoriteEmojiCount(this._db, unicodeOrName)
  }

  async getTopFavoriteEmoji (limit) {
    assertNumber(limit)
    await this.ready()
    return (await getTopFavoriteEmoji(this._db, this._custom, limit)).map(cleanEmoji)
  }

  set customEmoji (customEmojis) {
    this._custom = customEmojiIndex(customEmojis)
  }

  get customEmoji () {
    return this._custom.all
  }

  async close () {
    await shutdown(this)
    await closeDatabase(this._dbName)
  }

  async delete () {
    await shutdown(this)
    await deleteDatabase(this._dbName)
  }
}
