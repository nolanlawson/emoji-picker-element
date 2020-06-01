import { IndexedDBEngine } from './IndexedDBEngine'
import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { warnETag } from './utils/warnETag'
import { assertEmojiBaseData } from './utils/assertEmojiBaseData'
import { assertNumber } from './utils/assertNumber'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from './constants'
import { uniqEmoji } from './utils/uniqEmoji'
import { jsonChecksum } from '../svelte/utils/jsonChecksum'
import { warnOffline } from './utils/warnOffline'

export class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE } = {}) {
    this._dataSource = dataSource
    this._locale = locale
    this._idbEngine = undefined
    this._readyPromise = this._init()
  }

  async _init () {
    this._idbEngine = new IndexedDBEngine(`lite-emoji-picker-${this._locale}`)
    await this._idbEngine.open()
    const url = this._dataSource
    const isEmpty = await this._idbEngine.isEmpty()
    if (!isEmpty) {
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
      if (eTag && await this._idbEngine.hasData(url, eTag)) {
        console.log('Database already populated')
        return // fast init, data is already loaded
      }
    }
    let response
    try {
      response = await fetch(this._dataSource)
    } catch (e) { // offline fallback
      if (!isEmpty) {
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
    if (!isEmpty && await this._idbEngine.hasData(url, eTag)) {
      console.log('Database already populated')
      return // data already loaded
    }

    await this._idbEngine.loadData(emojiBaseData, url, eTag)
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    await this._readyPromise
    const emojis = await this._idbEngine.getEmojiByGroup(group)
    return uniqEmoji(emojis)
  }

  async getEmojiBySearchPrefix (prefix) {
    assertNonEmptyString(prefix)
    await this._readyPromise
    const emojis = await this._idbEngine.getEmojiBySearchPrefix(prefix)
    return uniqEmoji(emojis)
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    await this._readyPromise
    const emojis = await this._idbEngine.getEmojiByShortcode(shortcode)
    return uniqEmoji(emojis)
  }

  async getEmojiByUnicode (unicode) {
    assertNonEmptyString(unicode)
    await this._readyPromise
    return this._idbEngine.getEmojiByUnicode(unicode)
  }

  async close () {
    await this._readyPromise
    if (this._idbEngine) {
      await this._idbEngine.close()
      this._idbEngine = undefined
    }
  }

  async delete () {
    await this._readyPromise
    if (this._idbEngine) {
      await this._idbEngine.delete()
      this._idbEngine = undefined
    }
  }
}
