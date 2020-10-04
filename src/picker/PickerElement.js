import SveltePicker from './components/Picker/Picker.svelte'
import { mark } from '../shared/marks'
import { log } from '../shared/log'
import { css } from './cssLoader'
import enI18n from './i18n/en'
import { DEFAULT_SKIN_TONE_EMOJI, DEFAULT_SORTING } from './constants'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'

// We create our own custom element here because of several things I dislike about Svelte's built-in
// custom elements support:
// 1. Every component-within-a-component gets its own custom element, its own shadow DOM, etc.
// 2. Destroy lifecycle can cause memory leaks: https://github.com/sveltejs/svelte/issues/1152
// 3. Creation lifecycle has a strange API (have to pass in `target`)
// 4. Creation lifecycle has a weird timing issue https://github.com/sveltejs/svelte/pull/4527
// 5. To change which attributes are observed, have to use a workaround https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
export default class Picker extends HTMLElement {
  constructor (props) {
    mark('initialLoad')
    super()
    this.__props = Object.assign({
      dataSource: DEFAULT_DATA_SOURCE,
      locale: DEFAULT_LOCALE,
      i18n: enI18n,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_SORTING
    }, props)
    this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.innerHTML = css
    this.shadowRoot.appendChild(style)
  }

  connectedCallback () {
    this.__picker = new SveltePicker({
      target: this.shadowRoot,
      props: this.__props
    })
  }

  disconnectedCallback () {
    // Have to explicitly destroy the component to avoid memory leaks.
    // See https://github.com/sveltejs/svelte/issues/1152
    log('disconnectedCallback')
    if (this.__picker) {
      this.__picker.$destroy()
      this.__picker = null
    }
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji'] // complex objects aren't supported, also use kebab-case
  }

  // via https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
  attributeChangedCallback (attrName, oldValue, newValue) {
    const attrNameAsCamelCase = attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase())
    this[attrNameAsCamelCase] = newValue
  }

  get database () {
    return this.__picker.database // read-only
  }
}

// Reflect read-write properties to the Svelte component
for (const prop of ['locale', 'dataSource', 'skinToneEmoji', 'i18n', 'customEmoji', 'customCategorySorting']) {
  Object.defineProperty(Picker.prototype, prop, {
    get () {
      return this.__props[prop]
    },
    set (value) {
      this.__props[prop] = value
      if (this.__picker) {
        this.__picker[prop] = value
      }
    }
  })
}

customElements.define('emoji-picker', Picker)
