import { mark, stop } from '../../shared/marks'
import { calculateTextWidth } from './calculateTextWidth'
import { supportedZwjEmojis } from './emojiSupport'
import { log } from '../../shared/log'

let baselineEmojiWidth

export function checkZwjSupport (zwjEmojisToCheck, rootNode, baselineEmoji) {
  mark('checkZwjSupport')
  for (const emoji of zwjEmojisToCheck) {
    const domNode = rootNode.querySelector(`[data-emoji=${JSON.stringify(emoji.unicode)}]`)
    if (!domNode) { // happens rarely, mostly in jest tests
      continue
    }
    const emojiWidth = calculateTextWidth(domNode)
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji)
    }
    // compare sizes rounded to 1/10 of a pixel to avoid issues with slightly different measurements (e.g. GNOME Web)
    const supported = emojiWidth.toFixed(1) === baselineEmojiWidth.toFixed(1)
    supportedZwjEmojis.set(emoji.unicode, supported)
    /* istanbul ignore if */
    if (!supported) {
      log('Filtered unsupported emoji', emoji.unicode)
    }
  }
  stop('checkZwjSupport')
}
