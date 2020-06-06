import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { assertNumber } from './utils/assertNumber'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from './constants'
import { uniqEmoji } from './utils/uniqEmoji'
import { jsonChecksum } from './utils/jsonChecksum'
import { closeDatabase, deleteDatabase, openDatabase } from './databaseLifecycle'
import {
  isEmpty, hasData, loadData, getEmojiByGroup,
  getEmojiBySearchQuery, getEmojiByShortcode, getEmojiByUnicode
} from './idbInterface'
import { log } from '../shared/log'
import { getETag, getETagAndData } from './utils/ajax'

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
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE } = {}) {
    this._dataSource = dataSource
    this._locale = locale
    this._dbName = `emoji-picker-element-${this._locale}`
    this._db = undefined
    this._ready = this._init()
  }

  async _init () {
    const db = this._db = await openDatabase(this._dbName)
    const dataSource = this._dataSource
    const empty = await isEmpty(db)

    if (empty) {
      await loadDataForFirstTime(db, dataSource)
    } else { // offline-first - do an update asynchronously
      /* no await */ checkForUpdates(db, dataSource)
    }
  }

  async ready () {
    return this._ready
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    await this._ready
    const emojis = await getEmojiByGroup(this._db, group)
    return uniqEmoji(emojis)
  }

  async getEmojiBySearchQuery (query) {
    assertNonEmptyString(query)
    await this._ready
    const emojis = await getEmojiBySearchQuery(this._db, query)
    return uniqEmoji(emojis)
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    await this._ready
    return getEmojiByShortcode(this._db, shortcode)
  }

  async getEmojiByUnicode (unicode) {
    assertNonEmptyString(unicode)
    await this._ready
    return getEmojiByUnicode(this._db, unicode)
  }

  async close () {
    await this._ready
    if (this._db) {
      this._db = undefined
      await closeDatabase(this._dbName)
    }
  }

  async delete () {
    await this._ready
    if (this._db) {
      this._db = undefined
      await deleteDatabase(this._dbName)
    }
  }
}
