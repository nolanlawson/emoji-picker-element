import { IndexedDBEngine } from './IndexedDBEngine'
import { assertNonEmptyString } from './utils/assertNonEmptyString'

const DEFAULT_DATA_SOURCE = 'https://cdn.jsdelivr.net/npm/emojibase-data@5/en/compact.json'
const DEFAULT_LOCALE = 'en'

export class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE }) {
    this._dataSource = dataSource
    this._locale = locale
    this._idbEngine = undefined
    this._readyPromise = this._init()
  }

  async _init () {
    const emojiBaseData = await (await fetch(this._dataSource)).json()
    if (!emojiBaseData || !Array.isArray(emojiBaseData)) {
      throw new Error('Expected emojibase data, but data was in wrong format: ' + emojiBaseData)
    }
    this._idbEngine = new IndexedDBEngine(`lite-emoji-picker-${this._locale}`)
    await this._idbEngine.open()
  }

  async loadData (emojiBaseData) {
    if (!emojiBaseData || !Array.isArray(emojiBaseData)) {
      throw new Error('Expected emojibase data, got: ' + emojiBaseData)
    }
    await this._readyPromise
    await this._idbEngine.loadData(emojiBaseData)
  }

  async getEmojiByGroup (group) {
    if (typeof group !== 'number') {
      throw new Error('group must be a number, got: ' + group)
    }
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