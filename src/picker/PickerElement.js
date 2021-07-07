import SveltePicker from './components/Picker/Picker.svelte'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'
import { DEFAULT_CATEGORY_SORTING, DEFAULT_SKIN_TONE_EMOJI } from './constants'
import enI18n from '../picker/i18n/en.js'

export default class PickerElement extends HTMLElement {
  constructor (props) {
    performance.mark('initialLoad')
    super()
    this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = process.env.STYLES
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
}

const props = [
  'customCategorySorting',
  'customEmoji',
  'dataSource',
  'database',
  'i18n',
  'locale',
  'skinToneEmoji'
]
const definitions = Object.fromEntries(
  props.map(prop => ([
    prop, {
      get () {
        if (prop === 'database') {
          if (!this._cmp) {
            return null
          }
          const { $$ } = this._cmp
          return $$.ctx[$$.props[prop]]
        }
        return this._ctx[prop]
      },
      set (val) {
        if (prop === 'database') {
          throw new Error('Cannot set database')
        }
        this._setProp(prop, val)
      }
    }
  ]))
)

Object.defineProperties(PickerElement.prototype, definitions)

customElements.define('emoji-picker', PickerElement)
