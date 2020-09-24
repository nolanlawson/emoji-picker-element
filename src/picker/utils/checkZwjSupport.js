import { mark, stop } from '../../shared/marks'
import { calculateTextWidth } from './calculateTextWidth'
import { supportedZwjEmojis } from './emojiSupport'
import { log } from '../../shared/log'

let baselineEmojiWidth

export function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  mark('checkZwjSupport')
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji)
    const emojiWidth = calculateTextWidth(domNode)
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji)
    }
    // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
    // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
    // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
    // So here we set the threshold at 1.8 times the size of the baseline emoji.
    const supported = emojiWidth / 1.8 < baselineEmojiWidth
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
