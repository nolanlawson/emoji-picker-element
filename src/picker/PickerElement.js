import SveltePicker from './components/Picker/Picker.svelte'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import { DEFAULT_CATEGORY_SORTING, DEFAULT_SKIN_TONE_EMOJI } from './constants'
import enI18n from '../picker/i18n/en.js'
import styles from 'emoji-picker-element-styles'
import Database from './ImportedDatabase'

export default class PickerElement extends HTMLElement {
  constructor (props) {
    performance.mark('initialLoad')
    super()
    this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = styles
    this.shadowRoot.appendChild(style)
    this._ctx = {
      // Set defaults
      locale: DEFAULT_LOCALE,
      dataSource: DEFAULT_DATA_SOURCE,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_CATEGORY_SORTING,
      customEmoji: null,
      i18n: enI18n,
      ...props
    }
    this._dbFlush() // wait for a flush in case the user calls setAttribute('locale') or something
  }

  connectedCallback () {
    this._cmp = new SveltePicker({
      target: this.shadowRoot,
      props: this._ctx
    })
  }

  disconnectedCallback () {
    this._cmp.$destroy()
    this._cmp = undefined
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji'] // complex objects aren't supported, also use kebab-case
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    // convert from kebab-case to camelcase
    // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
    const prop = attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase())
    this._setProp(prop, newValue)
  }

  _setProp (prop, newValue) {
    this._ctx[prop] = newValue
    if (this._cmp) {
      this._cmp.$set({ [prop]: newValue })
    }
  }

  _dbCreate () {
    const { locale, dataSource, database } = this._ctx
    // only create a new database if we really need to
    if (!database || database.locale !== locale || database.dataSource !== dataSource) {
      this._setProp('database', new Database({ locale, dataSource }))
    }
  }

  // Update the Database in one microtask if the locale/dataSource/customEmoji change. We do one microtask
  // so we don't create two Databases if e.g. both the locale and the dataSource change
  _dbFlush () {
    if (!this._task) {
      this._task = Promise.resolve().then(() => {
        this._task = undefined
        this._dbCreate()
      })
    }
  }
}

const props = [
  'customEmoji',
  'customCategorySorting',
  'database',
  'dataSource',
  'i18n',
  'locale',
  'skinToneEmoji'
]
const definitions = {}

for (const prop of props) {
  definitions[prop] = {
    get () {
      if (prop === 'database' && !this._ctx[prop]) {
        // in rare cases, the microtask may not be flushed yet, so we need to instantiate the DB
        // now if the user is asking for it
        this._dbCreate()
      }
      return this._ctx[prop]
    },
    set (val) {
      if (prop === 'database') {
        throw new Error('database is read-only')
      } else if (['locale', 'dataSource', 'customEmoji'].includes(prop)) {
        this._dbFlush()
      }
      this._setProp(prop, val)
    }
  }
}

Object.defineProperties(PickerElement.prototype, definitions)

customElements.define('emoji-picker', PickerElement)
