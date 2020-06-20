import SveltePicker from './components/Picker/Picker.svelte'
import { mark } from '../shared/marks'
import { log } from '../shared/log'

export default class Picker extends SveltePicker {
  constructor (props) {
    mark('initialLoad')
    // Make the API simpler, directly pass in the props
    super({ props })
  }

  disconnectedCallback () {
    // Have to explicitly destroy the component to avoid memory leaks.
    // See https://github.com/sveltejs/svelte/issues/1152
    log('disconnectedCallback')
    this.$destroy()
  }
}

customElements.define('emoji-picker', Picker)
