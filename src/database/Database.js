import { IndexedDBEngine } from './IndexedDBEngine'
import { assertNonEmptyString } from './utils/assertNonEmptyString'
import { assertETag } from './utils/assertETag'
import { assertEmojiBaseData } from './utils/assertEmojiBaseData'
import { assertNumber } from './utils/assertNumber'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from './constants'

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
    if (!(await this._idbEngine.isEmpty())) {
      // just do a simple HEAD request first to see if the eTags match
      let headResponse
      try {
        headResponse = await fetch(this._dataSource, { method: 'HEAD' })
      } catch (e) {
        // offline fallback, just keep current data
        console.warn('lite-emoji-picker: falling back to offline mode', e)
        return
      }
      const eTag = headResponse.headers.get('etag')
      assertETag(eTag)
      if (await this._idbEngine.hasData(this._dataSource, eTag)) {
        return // fast init, data is already loaded
      }
    }
    const response = await fetch(this._dataSource)
    const emojiBaseData = await response.json()
    assertEmojiBaseData(emojiBaseData)
    const eTag = response.headers.get('etag')
    assertETag(eTag)

    await this._idbEngine.loadData(emojiBaseData, this._dataSource, eTag)
  }

  async getEmojiByGroup (group) {
    assertNumber(group)
    await this._readyPromise
    return this._idbEngine.getEmojiByGroup(group)
  }

  async getEmojiBySearchPrefix (prefix) {
    assertNonEmptyString(prefix)
    await this._readyPromise
    return this._idbEngine.getEmojiBySearchPrefix(prefix)
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode)
    await this._readyPromise
    return this._idbEngine.getEmojiByShortcode(shortcode)
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
