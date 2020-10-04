import { uniq } from '../../../shared/uniq'
import { unicodeWithSkin } from '../../utils/unicodeWithSkin'

export let searchMode = false // eslint-disable-line prefer-const
export let activeSearchItem = null // eslint-disable-line prefer-const
export let emoji // eslint-disable-line prefer-const
export let currentSkinTone // eslint-disable-line prefer-const
export let i //  // eslint-disable-line prefer-const

// eslint-disable-next-line no-unused-vars
function labelWithSkin (emoji, currentSkinTone) {
  return uniq([(emoji.name || unicodeWithSkin(emoji, currentSkinTone)), ...emoji.shortcodes]).join(', ')
}
