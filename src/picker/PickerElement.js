import SveltePicker from './components/Picker/Picker.svelte'

export default class Picker extends SveltePicker {
  constructor (props) {
    performance.mark('initialLoad')
    // Make the API simpler, directly pass in the props
    super({ props })
  }

  disconnectedCallback () {
    // Have to explicitly destroy the component to avoid memory leaks.
    // See https://github.com/sveltejs/svelte/issues/1152
    console.log('disconnectedCallback')
    this.$destroy()
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
