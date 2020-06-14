const requiredKeys = [
  'shortcode',
  'url'
]

export function assertCustomEmojis (customEmojis) {
  if (!customEmojis || !Array.isArray(customEmojis ||
    (customEmojis[0] && requiredKeys.some(key => !(key in customEmojis[0]))))) {
    throw new Error('Expected custom emojis to be in correct format')
  }
}
