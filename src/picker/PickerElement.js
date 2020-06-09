import SveltePicker from './components/Picker/Picker.svelte'
import Database from './ImportedDatabase'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import enI18n from './i18n/en.json'
import { mark } from '../shared/marks'

export default class Picker extends SveltePicker {
  constructor ({
    locale = DEFAULT_LOCALE,
    dataSource = DEFAULT_DATA_SOURCE,
    i18n = enI18n
  } = {}) {
    mark('initialLoad')
    // Make the API simpler, directly pass in the props
    // Also wrap the locale/dataSource into a Database object
    super({
      props: {
        database: new Database({ dataSource, locale }),
        i18n
      }
    })
    this._locale = locale
    this._dataSource = dataSource
    this._updateScheduled = undefined
  }

  static get observedAttributes () {
    return ['locale', 'dataSource', 'i18n']
  }

  get locale () {
    return this._locale
  }

  get dataSource () {
    return this._dataSource
  }

  set locale (locale) {
    this._locale = locale
    this._scheduleUpdate()
  }

  set dataSource (dataSource) {
    this._dataSource = dataSource
    this._scheduleUpdate()
  }

  _scheduleUpdate () {
    if (this._updateScheduled) {
      return
    }
    // We want to update the Database once if dataSource/locale are both updated in one turn of the event loop, e.g.:
    // picker.locale = 'fr' ; picker.dataSource = '/node_modules/emojibase-data/fr/data.json';
    // ^ This should only cause one network request and one new Database to be created
    this._updateScheduled = Promise.resolve().then(() => {
      this.database = new Database({ dataSource: this._dataSource, locale: this._locale })
      this._updateScheduled = undefined
    })
  }
}

customElements.define('emoji-picker', Picker)
