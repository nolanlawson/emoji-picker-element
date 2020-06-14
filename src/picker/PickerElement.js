import SveltePicker from './components/Picker/Picker.svelte'
import Database from './ImportedDatabase'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import enI18n from './i18n/en'
import { mark } from '../shared/marks'
import { DEFAULT_SKIN_TONE_EMOJI } from './constants'

export default class Picker extends SveltePicker {
  constructor ({
    locale = DEFAULT_LOCALE,
    dataSource = DEFAULT_DATA_SOURCE,
    i18n = enI18n,
    skinToneEmoji = DEFAULT_SKIN_TONE_EMOJI
  } = {}) {
    mark('initialLoad')
    // Make the API simpler, directly pass in the props
    // Also wrap the locale/dataSource into a Database object
    super({
      props: {
        database: new Database({ dataSource, locale }),
        i18n,
        skinToneEmoji
      }
    })
  }
}

customElements.define('emoji-picker', Picker)
