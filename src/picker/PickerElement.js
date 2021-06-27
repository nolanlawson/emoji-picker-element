import SveltePicker from './components/Picker/Picker.svelte'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../database/constants'

export default class Picker extends SveltePicker {
  constructor (props = {}) {
    performance.mark('initialLoad')
    // Set defaults
    props.locale = props.locale || DEFAULT_LOCALE
    props.dataSource = props.dataSource || DEFAULT_DATA_SOURCE
    // Make the API simpler, directly pass in the props
    super({ props })
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji'] // complex objects aren't supported, also use kebab-case
  }

  // via https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
  attributeChangedCallback (attrName, oldValue, newValue) {
    super.attributeChangedCallback(
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      oldValue,
      newValue
    )
  }
}

customElements.define('emoji-picker', Picker)
