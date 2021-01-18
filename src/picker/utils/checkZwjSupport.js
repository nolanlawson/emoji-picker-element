import { mark, stop } from '../../shared/marks'
import { calculateTextWidth } from './calculateTextWidth'
import { supportedZwjEmojis } from './emojiSupport'
import { log } from '../../shared/log'
import { checkZwjRendersAsOneGlyph } from './checkZwjRendersAsOneGlyph.js'

let baselineEmojiWidth

export function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  mark('checkZwjSupport')
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji)
    const emojiWidth = calculateTextWidth(domNode)
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji)
    }
    const supported = checkZwjRendersAsOneGlyph(emojiWidth, baselineEmojiWidth)
    supportedZwjEmojis.set(emoji.unicode, supported)
    /* istanbul ignore next */
    if (!supported) {
      log('Filtered unsupported emoji', emoji.unicode, emojiWidth, baselineEmojiWidth)
    } else if (emojiWidth !== baselineEmojiWidth) {
      log('Allowed borderline emoji', emoji.unicode, emojiWidth, baselineEmojiWidth)
    }
  }
  stop('checkZwjSupport')
}
