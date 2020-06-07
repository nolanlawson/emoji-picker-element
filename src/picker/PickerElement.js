import SveltePicker from './components/Picker/Picker.svelte'

export default class Picker extends SveltePicker {
  constructor (props) {
    super({ props }) // make the API simpler, directly pass in the params
  }
}

customElements.define('emoji-picker', Picker)
