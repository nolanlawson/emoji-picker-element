import { Picker } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { dataSource } from './utils.js'

document.body.appendChild(new Picker({ dataSource }))
