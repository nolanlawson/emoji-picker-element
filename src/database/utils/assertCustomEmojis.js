const requiredKeys = [
  'shortcode',
  'url'
]

export function assertCustomEmojis (customEmojis) {
  const isArray = customEmojis && Array.isArray(customEmojis)
  const firstItemIsFaulty = isArray &&
    customEmojis.length &&
    (!customEmojis[0] || requiredKeys.some(key => !(key in customEmojis[0])))
  if (!isArray || firstItemIsFaulty) {
    throw new Error('Expected custom emojis to be in correct format')
  }
}
