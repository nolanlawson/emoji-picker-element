import SveltePicker from './components/Picker/Picker.svelte'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import { DEFAULT_CATEGORY_SORTING, DEFAULT_SKIN_TONE_EMOJI } from './constants'
import enI18n from '../picker/i18n/en.js'
import styles from 'emoji-picker-element-styles'
import Database from './ImportedDatabase'

const PROPS = [
  'customEmoji',
  'customCategorySorting',
  'database',
  'dataSource',
  'i18n',
  'locale',
  'skinToneEmoji'
]

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
    // Handle properties set before the element was upgraded
    for (const prop of PROPS) {
      if (prop !== 'database' && typeof this[prop] !== 'undefined') {
        this._ctx[prop] = this[prop]
      }
    }
    this._dbFlush() // wait for a flush before creating the db, in case the user calls e.g. a setter or setAttribute
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

    const { database } = this._ctx
    if (database) {
      database.close()
        // only happens if the database failed to load in the first place, so we don't care)
        .catch(err => console.error(err))
    }
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji'] // complex objects aren't supported, also use kebab-case
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    // convert from kebab-case to camelcase
    // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
    this._set(
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      newValue
    )
  }

  _set (prop, newValue) {
    this._ctx[prop] = newValue
    if (this._cmp) {
      this._cmp.$set({ [prop]: newValue })
    }
    if (['locale', 'dataSource'].includes(prop)) {
      this._dbFlush()
    }
  }

  _dbCreate () {
    const { locale, dataSource, database } = this._ctx
    // only create a new database if we really need to
    if (!database || database.locale !== locale || database.dataSource !== dataSource) {
      this._set('database', new Database({ locale, dataSource }))
    }
  }

  // Update the Database in one microtask if the locale/dataSource change. We do one microtask
  // so we don't create two Databases if e.g. both the locale and the dataSource change
  _dbFlush () {
    Promise.resolve().then(() => (
      this._dbCreate()
    ))
  }
}

const definitions = {}

for (const prop of PROPS) {
  definitions[prop] = {
    get () {
      if (prop === 'database') {
        // in rare cases, the microtask may not be flushed yet, so we need to instantiate the DB
        // now if the user is asking for it
        this._dbCreate()
      }
      return this._ctx[prop]
    },
    set (val) {
      if (prop === 'database') {
        throw new Error('database is read-only')
      }
      this._set(prop, val)
    }
  }
}

Object.defineProperties(PickerElement.prototype, definitions)

customElements.define('emoji-picker', PickerElement)
