// remove some internal implementation details, i.e. the "tokens" array on the emoji object
// essentially, convert the emoji from the version stored in IDB to the version used in-memory
export function cleanEmoji (emoji) {
  if (!emoji) {
    return emoji
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
