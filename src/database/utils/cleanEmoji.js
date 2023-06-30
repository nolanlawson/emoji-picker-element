const isFirefoxContentScript = typeof wrappedJSObject !== 'undefined'

// remove some internal implementation details, i.e. the "tokens" array on the emoji object
// essentially, convert the emoji from the version stored in IDB to the version used in-memory
export function cleanEmoji (emoji) {
  if (!emoji) {
    return emoji
  }
  // if inside a Firefox content script, need to clone the emoji object to prevent Firefox from complaining about
  // cross-origin object. See: https://github.com/nolanlawson/emoji-picker-element/issues/356
  /* istanbul ignore if */
  if (isFirefoxContentScript) {
    emoji = structuredClone(emoji)
  }
  delete emoji.tokens
  if (emoji.skinTones) {
    const len = emoji.skinTones.length
    emoji.skins = Array(len)
    for (let i = 0; i < len; i++) {
      emoji.skins[i] = {
        tone: emoji.skinTones[i],
        unicode: emoji.skinUnicodes[i],
        version: emoji.skinVersions[i]
      }
    }
    delete emoji.skinTones
    delete emoji.skinUnicodes
    delete emoji.skinVersions
  }
  return emoji
}
