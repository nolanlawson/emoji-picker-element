import SveltePicker from './components/Picker/Picker.svelte'
import { mark } from '../shared/marks'

export default class Picker extends SveltePicker {
  constructor (props) {
    mark('initialLoad')
    // Make the API simpler, directly pass in the props
    super({ props })
  }
}

customElements.define('emoji-picker', Picker)
