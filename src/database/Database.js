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
  setOnCloseListener,
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

export default class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this.dataSource = dataSource
    this.locale = locale
    this._dbName = `emoji-picker-element-${this.locale}`
    this._db = undefined
    this._lazyUpdate = undefined
    this._custom = customEmojiIndex(customEmoji)

    this._clear = this._clear.bind(this)
    this._ready = this._init()
  }

  async _init () {
    const db = this._db = await openDatabase(this._dbName)

    setOnCloseListener(db, this._clear)
    const dataSource = this.dataSource
    const empty = await isEmpty(db)

    if (empty) {
      await loadDataForFirstTime(db, dataSource)
    } else { // offline-first - do an update asynchronously
      this._lazyUpdate = checkForUpdates(db, dataSource)
    }
  }

  async ready () {
    const checkReady = async () => {
      if (!this._ready) {
        this._ready = this._init()
      }
      return this._ready
    }
    await checkReady()
    // There's a possibility of a race condition where the element gets added, removed, and then added again
    // with a particular timing, which would set the _db to undefined.
    // We *could* do a while loop here, but that seems excessive and could lead to an infinite loop.
    if (!this._db) {
      await checkReady()
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

  async _shutdown () {
    await this.ready() // reopen if we've already been closed/deleted
    try {
      await this._lazyUpdate // allow any lazy updates to process before closing/deleting
    } catch (err) { /* ignore network errors (offline-first) */ }
  }

  // clear references to IDB, e.g. during a close event
  _clear () {
    console.log('_clear database', this._dbName)
    // We don't need to call removeEventListener or remove the manual "close" listeners.
    // The memory leak tests prove this is unnecessary. It's because:
    // 1) IDBDatabases that can no longer fire "close" automatically have listeners GCed
    // 2) we clear the manual close listeners in databaseLifecycle.js.
    this._db = this._ready = this._lazyUpdate = undefined
  }

  async close () {
    await this._shutdown()
    await closeDatabase(this._db)
  }

  async delete () {
    await this._shutdown()
    await deleteDatabase(this._dbName)
  }
}
