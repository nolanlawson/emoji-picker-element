import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { warnETag } from './utils/warnETag'
import { assertEmojiBaseData } from './utils/assertEmojiBaseData'
import { assertNumber } from './utils/assertNumber'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from './constants'
import { uniqEmoji } from './utils/uniqEmoji'
import { jsonChecksum } from './utils/jsonChecksum'
import { warnOffline } from './utils/warnOffline'
import { closeDatabase, deleteDatabase, openDatabase } from './databaseLifecycle'
import {
  isEmpty, hasData, loadData, getEmojiByGroup,
  getEmojiBySearchPrefix, getEmojiByShortcode, getEmojiByUnicode
} from './idbInterface'

export default class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE } = {}) {
    this._dataSource = dataSource
    this._locale = locale
    this._dbName = `lite-emoji-picker-${this._locale}`
    this._db = undefined
    this._ready = this._init()
  }

  async _init () {
    this._db = await openDatabase(this._dbName)
    const url = this._dataSource
    const empty = await isEmpty(this._db)
    if (!empty) {
      // just do a simple HEAD request first to see if the eTags match
      let headResponse
      try {
        headResponse = await fetch(url, { method: 'HEAD' })
      } catch (e) { // offline fallback
        warnOffline(e)
        return
      }
      const eTag = headResponse.headers.get('etag')
      warnETag(eTag)
      if (eTag && await hasData(this._db, url, eTag)) {
        console.log('Database already populated')
        return // fast init, data is already loaded
      }
    }
    let response
    try {
      response = await fetch(this._dataSource)
    } catch (e) { // offline fallback
      if (!empty) {
        warnOffline(e)
        return
      }
      throw e
    }
    const emojiBaseData = await response.json()
    assertEmojiBaseData(emojiBaseData)
    let eTag = response.headers.get('etag')
    warnETag(eTag)
    if (!eTag) {
      // GNOME Web returns an empty eTag for cross-origin HEAD requests, even when
      // Access-Control-Expose-Headers:* is set. So as a fallback, compute an ETag
      // from the object itself.
      eTag = await jsonChecksum(emojiBaseData)
    }
    if (!empty && await hasData(this._db, url, eTag)) {
      console.log('Database already populated')
      return // data already loaded
    }

    await loadData(this._db, emojiBaseData, url, eTag)
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

  async getEmojiBySearchPrefix (prefix) {
    assertNonEmptyString(prefix)
    await this._ready
    const emojis = await getEmojiBySearchPrefix(this._db, prefix)
    return uniqEmoji(emojis)
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    await this._ready
    const emojis = await getEmojiByShortcode(this._db, shortcode)
    return uniqEmoji(emojis)
  }

  async getEmojiByUnicode (unicode) {
    assertNonEmptyString(unicode)
    await this._ready
    return getEmojiByUnicode(this._db, unicode)
  }

  async close () {
    await this._ready
    if (this._db) {
      await closeDatabase(this._dbName)
      this._db = undefined
    }
  }

  async delete () {
    await this._ready
    if (this._db) {
      await deleteDatabase(this._dbName)
      this._db = undefined
    }
  }
}
