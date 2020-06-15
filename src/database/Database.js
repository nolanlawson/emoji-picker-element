import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { assertNumber } from './utils/assertNumber'
import {
  DEFAULT_DATA_SOURCE,
  DEFAULT_LOCALE,
  KEY_PREFERRED_SKINTONE,
  STORE_KEYVALUE
} from './constants'
import { uniqEmoji } from './utils/uniqEmoji'
import { jsonChecksum } from './utils/jsonChecksum'
import { closeDatabase, deleteDatabase, openDatabase } from './databaseLifecycle'
import {
  isEmpty, hasData, loadData, getEmojiByGroup,
  getEmojiBySearchQuery, getEmojiByShortcode, getEmojiByUnicode,
  get, set, getTopFavoriteEmoji, incrementFavoriteEmojiCount
} from './idbInterface'
import { log } from '../shared/log'
import { getETag, getETagAndData } from './utils/ajax'
import { customEmojiIndex } from './customEmojiIndex'

async function checkForUpdates (db, dataSource) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiBaseData
  let eTag = await getETag(dataSource)
  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    const eTagAndData = await getETagAndData(dataSource)
    eTag = eTagAndData[0]
    emojiBaseData = eTagAndData[1]
    if (!eTag) {
      eTag = await jsonChecksum(emojiBaseData)
    }
  }
  if (await hasData(db, dataSource, eTag)) {
    log('Database already populated')
  } else {
    log('Database update available')
    if (!emojiBaseData) {
      const eTagAndData = await getETagAndData(dataSource)
      emojiBaseData = eTagAndData[1]
    }
    await loadData(db, emojiBaseData, dataSource, eTag)
  }
}

async function loadDataForFirstTime (db, dataSource) {
  let [eTag, emojiBaseData] = await getETagAndData(dataSource)
  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiBaseData)
  }

  await loadData(db, emojiBaseData, dataSource, eTag)
}

export default class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this._dataSource = dataSource
    this._locale = locale
    this._dbName = `emoji-picker-element-${this._locale}`
    this._db = undefined
    this._lazyUpdate = undefined
    this._custom = customEmojiIndex(customEmoji)

    this._ready = this._init()
  }

  async _init () {
    const db = this._db = await openDatabase(this._dbName)
    const dataSource = this._dataSource
    const empty = await isEmpty(db)

    if (empty) {
      await loadDataForFirstTime(db, dataSource)
    } else { // offline-first - do an update asynchronously
      this._lazyUpdate = checkForUpdates(db, dataSource)
    }
  }

  async ready () {
    if (!this._ready) {
      this._ready = this._init()
    }
    return this._ready
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    await this.ready()
    const emojis = await getEmojiByGroup(this._db, group)
    return uniqEmoji(emojis)
  }

  async getEmojiBySearchQuery (query) {
    assertNonEmptyString(query)
    await this.ready()
    const customs = this._custom.search(query)
    const natives = uniqEmoji(await getEmojiBySearchQuery(this._db, query))
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
    return getEmojiByShortcode(this._db, shortcode)
  }

  async getEmojiByUnicode (unicode) {
    assertNonEmptyString(unicode)
    await this.ready()
    return getEmojiByUnicode(this._db, unicode)
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
    return getTopFavoriteEmoji(this._db, this._custom, limit)
  }

  set customEmoji (customEmojis) {
    this._custom = customEmojiIndex(customEmojis)
  }

  get customEmoji () {
    return this._custom.all
  }

  getCustomEmojiByName (name) {
    assertNonEmptyString(name)
    return this._custom.byName(name)
  }

  async _shutdown () {
    await this.ready() // reopen if we've already been closed/deleted
    try {
      await this._lazyUpdate // allow any lazy updates to process before closing/deleting
    } catch (err) { /* ignore network errors (offline-first) */ }
    if (this._db) {
      this._db = this._ready = this._lazyUpdate = undefined
      return true // we need to actually run the close/delete logic, so we return true
    }
  }

  async close () {
    if (await this._shutdown()) {
      await closeDatabase(this._dbName)
    }
  }

  async delete () {
    if (await this._shutdown()) {
      await deleteDatabase(this._dbName)
    }
  }
}
