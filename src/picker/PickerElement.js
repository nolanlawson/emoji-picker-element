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

  // disconnectedCallback () {
  //   const runAll = funcs => (funcs && funcs.forEach(func => func()))
  //   // For Svelte v <3.33.0, we have to run the destroy logic ourselves because it doesn't have this fix:
  //   // https://github.com/sveltejs/svelte/commit/d4f98f
  //   // We can safely just run on_disconnect and on_destroy to cover all versions of Svelte. In older versions
  //   // the on_destroy array will have length 1, whereas in more recent versions it'll be on_disconnect instead.
  //   // TODO: remove this when we drop support for Svelte < 3.33.0
  //   runAll(this.$$.on_destroy)
  //   runAll(this.$$.on_disconnect)
  // }

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
