import { calculateTextWidth } from './calculateTextWidth'
import { supportedZwjEmojis } from './emojiSupport'
import { BASELINE_EMOJI } from './baselineEmoji.js'

let baselineEmojiWidth
let fallbackNode

// only used in tests
let simulateBrowserNotSupportingZWJEmoji = false
export function setSimulateBrowserNotSupportingZWJEmoji (value) {
  simulateBrowserNotSupportingZWJEmoji = value
}

function calculateTextWidthWithFallback (unicode, domNode, baselineEmojiNode) {
  const result = calculateTextWidth(domNode)
  /* istanbul ignore if */
  if (!result) {
    // If result is 0 then very likely the emoji-picker has `display:none` or equivalent. In that case, we fall back to
    // cloning the baseline emoji, putting that in the `document.body`, and measuring that instead. This is a perf hit,
    // but it's better than mistakenly filtering emoji: https://github.com/nolanlawson/emoji-picker-element/issues/514
    console.log('Picker is hidden, using fallback node for width calculation', unicode)
    if (!fallbackNode) {
      fallbackNode = baselineEmojiNode.cloneNode(true)
      // We have to copy styles because we're copying from an element in the shadow DOM to the light DOM
      // We can't use the shadow DOM because it's likely the entire picker is `display:none`
      const styles = getComputedStyle(baselineEmojiNode)
      // probably don't need display/align-items/justify-content but let's play it safe
      for (const prop of ['font-family', 'line-height', 'width', 'height', 'font-size', 'display', 'align-items', 'justify-content']) {
        // set `!important` just in case some global styles might try to overwrite this
        fallbackNode.style.setProperty(prop, styles.getPropertyValue(prop), 'important')
      }
    }
    try {
      document.body.appendChild(fallbackNode)
      fallbackNode.firstChild.nodeValue = unicode
      return calculateTextWidth(fallbackNode)
    } finally {
      // avoid actually rendering the test emoji
      fallbackNode.remove()
    }
  }
  return result
}

/**
 * Check if the given emojis containing ZWJ characters are supported by the current browser (don't render
 * as double characters) and return true if all are supported.
 * @param zwjEmojisToCheck
 * @param baselineEmojiNode
 * @param emojiToDomNode
 */
export function checkZwjSupport (zwjEmojisToCheck, baselineEmojiNode, emojiToDomNode) {
  performance.mark('checkZwjSupport')
  let allSupported = true
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
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidthWithFallback(BASELINE_EMOJI, baselineEmojiNode, baselineEmojiNode)
    }
    const emojiWidth = calculateTextWidthWithFallback(emoji.unicode, domNode, baselineEmojiNode)
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
  performance.measure('checkZwjSupport', 'checkZwjSupport')
  return allSupported
}
