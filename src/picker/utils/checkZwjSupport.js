import { calculateTextWidth } from './calculateTextWidth'
import { supportedZwjEmojis } from './emojiSupport'

let baselineEmojiWidth

// only used in tests
let simulateBrowserNotSupportingZWJEmoji = false
export function setSimulateBrowserNotSupportingZWJEmoji (value) {
  simulateBrowserNotSupportingZWJEmoji = value
}

/**
 * Check if the given emojis containing ZWJ characters are supported by the current browser (don't render
 * as double characters) and return true if all are supported.
 * @param zwjEmojisToCheck
 * @param baselineEmoji
 * @param emojiToDomNode
 */
export function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  performance.mark('checkZwjSupport')
  let allSupported = true
  let shouldWarn = false
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji)
    // sanity check to make sure the node is defined properly
    /* istanbul ignore if */
    if (!domNode) {
      // This is a race condition that can occur when the component is unmounted/remounted
      // It doesn't really matter what we do here since the old context is not going to render anymore.
      // Just bail out of emoji support detection and return `allSupported=true` since the rendering context is gone
      continue
    }
    const emojiWidth = calculateTextWidth(domNode)
    /* istanbul ignore if */
    if (emojiWidth === 0) {
      shouldWarn = true
    }
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji)
    }
    // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
    // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
    // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
    // So here we set the threshold at 1.8 times the size of the baseline emoji.
    const supported = !simulateBrowserNotSupportingZWJEmoji && emojiWidth / 1.8 < baselineEmojiWidth
    supportedZwjEmojis.set(emoji.unicode, supported)

    if (!supported) {
      allSupported = false
      console.log('Filtered unsupported ZWJ emoji', emoji.unicode, emojiWidth, baselineEmojiWidth)
    }

    /* istanbul ignore next */
    if (supported && emojiWidth !== baselineEmojiWidth) {
      console.log('Allowed borderline ZWJ emoji', emoji.unicode, emojiWidth, baselineEmojiWidth)
    }
  }
  // Warn exactly once since we don't want to spam the console
  /* istanbul ignore if */
  if (shouldWarn) {
    console.warn('Emoji support detection failed - emoji character is 0 width.\n' +
      'This is likely due to using `display:none` which is unsupported.\n' +
      'If this is a Jest/Vitest environment, you can ignore this warning.\n' +
      'For details see: https://github.com/nolanlawson/emoji-picker-element/issues/514'
    )
  }
  performance.measure('checkZwjSupport', 'checkZwjSupport')
  return allSupported
}
