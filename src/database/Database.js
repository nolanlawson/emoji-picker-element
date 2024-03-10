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
  deleteDatabase
} from './databaseLifecycle'
import {
  getEmojiByGroup,
  getEmojiBySearchQuery, getEmojiByShortcode, getEmojiByUnicode,
  get, set, getTopFavoriteEmoji, incrementFavoriteEmojiCount
} from './idbInterface'
import { customEmojiIndex } from './customEmojiIndex'
import { cleanEmoji } from './utils/cleanEmoji'
import { initDatabase } from './initDatabase.js'

export default class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this.dataSource = dataSource
    this.locale = locale
    this._dbName = `emoji-picker-element-${this.locale}`
    this._custom = customEmojiIndex(customEmoji)

    this._clear = this._clear.bind(this)
    /* no await */ this._init()
  }

  async _init () {
    if (this._controller) {
      this._controller.abort()
    }
    this._controller = new AbortController()
    this._dbPromise = initDatabase(this._dbName, this.dataSource, this._clear, this._controller.signal)
  }

  async ready () {
    await this._recreateIfNecessary()
    await this._dbPromise
  }

  async _recreateIfNecessary () {
    if (!this._controller) {
      await this._init()
    }
    const db = await this._dbPromise
    return db
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    const db = await this._recreateIfNecessary()
    return uniqEmoji(await getEmojiByGroup(db, group)).map(cleanEmoji)
  }

  async getEmojiBySearchQuery (query) {
    assertNonEmptyString(query)
    const db = await this._recreateIfNecessary()
    const customs = this._custom.search(query)
    const natives = uniqEmoji(await getEmojiBySearchQuery(db, query)).map(cleanEmoji)
    return [
      ...customs,
      ...natives
    ]
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    const db = await this._recreateIfNecessary()
    const custom = this._custom.byShortcode(shortcode)
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByShortcode(db, shortcode))
  }

  async getEmojiByUnicodeOrName (unicodeOrName) {
    assertNonEmptyString(unicodeOrName)
    const db = await this._recreateIfNecessary()
    const custom = this._custom.byName(unicodeOrName)
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByUnicode(db, unicodeOrName))
  }

  async getPreferredSkinTone () {
    const db = await this._recreateIfNecessary()
    return (await get(db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE)) || 0
  }

  async setPreferredSkinTone (skinTone) {
    assertNumber(skinTone)
    const db = await this._recreateIfNecessary()
    return set(db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE, skinTone)
  }

  async incrementFavoriteEmojiCount (unicodeOrName) {
    assertNonEmptyString(unicodeOrName)
    const db = await this._recreateIfNecessary()
    return incrementFavoriteEmojiCount(db, unicodeOrName)
  }

  async getTopFavoriteEmoji (limit) {
    assertNumber(limit)
    const db = await this._recreateIfNecessary()
    return (await getTopFavoriteEmoji(db, this._custom, limit)).map(cleanEmoji)
  }

  set customEmoji (customEmojis) {
    this._custom = customEmojiIndex(customEmojis)
  }

  get customEmoji () {
    return this._custom.all
  }

  _shutdown () {
    if (this._controller) {
      this._controller.abort()
      this._controller = undefined
      this._dbPromise = undefined
    }
  }

  // clear references to IDB, e.g. during a close event
  _clear () {
    console.log('_clear database', this._dbName)
    // We don't need to call removeEventListener or remove the manual "close" listeners.
    // The memory leak tests prove this is unnecessary. It's because:
    // 1) IDBDatabases that can no longer fire "close" automatically have listeners GCed
    // 2) we clear the manual close listeners in databaseLifecycle.js.
    this._shutdown()
  }

  async close () {
    this._shutdown()
    await closeDatabase(this._dbName)
  }

  async delete () {
    this._shutdown()
    await deleteDatabase(this._dbName)
  }
}
