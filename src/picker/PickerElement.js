import { createRoot } from './components/Picker/Picker.js'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import { DEFAULT_CATEGORY_SORTING, DEFAULT_SKIN_TONE_EMOJI, FONT_FAMILY } from './constants'
import enI18n from './i18n/en.js'
import Database from './ImportedDatabase'
import { queueMicrotask } from './utils/queueMicrotask.js'
import FirefoxRescuerElementBase from './utils/FirefoxRescuerElementBase.js'
import baseStyles from './styles/picker.scss'

const PROPS = [
  'customEmoji',
  'customCategorySorting',
  'database',
  'dataSource',
  'i18n',
  'locale',
  'skinToneEmoji',
  'emojiVersion'
]

// Styles injected ourselves, so we can declare the FONT_FAMILY variable in one place
const EXTRA_STYLES = `:host{--emoji-font-family:${FONT_FAMILY}}`

export default class PickerElement extends FirefoxRescuerElementBase {
  constructor (props) {
    performance.mark('initialLoad')
    super()
    this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = baseStyles + EXTRA_STYLES
    this.shadowRoot.appendChild(style)
    this._ctx = {
      // Set defaults
      locale: DEFAULT_LOCALE,
      dataSource: DEFAULT_DATA_SOURCE,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_CATEGORY_SORTING,
      customEmoji: null,
      i18n: enI18n,
      emojiVersion: null,
      ...props
    }
    // Handle properties set before the element was upgraded
    for (const prop of PROPS) {
      if (prop !== 'database' && Object.prototype.hasOwnProperty.call(this, prop)) {
        this._ctx[prop] = this[prop]
        delete this[prop]
      }
    }
    this._dbFlush() // wait for a flush before creating the db, in case the user calls e.g. a setter or setAttribute
  }

  connectedCallback () {
    // The _cmp may be defined if the component was immediately disconnected and then reconnected. In that case,
    // do nothing (preserve the state)
    if (!this._cmp) {
      this._cmp = createRoot(this.shadowRoot, this._ctx)
    }
  }

  disconnectedCallback () {
    // Call super to fix Firefox iframe bug (must happen before accessing instance methods)
    super.disconnectedCallback?.()

    // Check in a microtask if the element is still connected. If so, treat this as a "move" rather than a disconnect
    // Inspired by Vue: https://vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue
    queueMicrotask(() => {
      // this._cmp may be defined if connect-disconnect-connect-disconnect occurs synchronously
      if (!this.isConnected && this._cmp) {
        this._cmp.$destroy()
        this._cmp = undefined

        const { database } = this._ctx
        database.close()
          // only happens if the database failed to load in the first place, so we don't care
          .catch(err => console.error(err))
      }
    })
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji', 'emoji-version'] // complex objects aren't supported, also use kebab-case
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    this._set(
      // convert from kebab-case to camelcase
      // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      // convert string attribute to float if necessary
      attrName === 'emoji-version' ? parseFloat(newValue) : newValue
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
    queueMicrotask(() => (
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

/* istanbul ignore else */
if (!customElements.get('emoji-picker')) { // if already defined, do nothing (e.g. same script imported twice)
  customElements.define('emoji-picker', PickerElement)
}
