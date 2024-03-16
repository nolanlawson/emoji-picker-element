import { concatenateAdjacentExpressionsRollupPlugin } from './config/concatenateAdjacentExpressionsRollupPlugin.js'

console.log(concatenateAdjacentExpressionsRollupPlugin().transform('html`<div>yolo${foo}</div>`'))

