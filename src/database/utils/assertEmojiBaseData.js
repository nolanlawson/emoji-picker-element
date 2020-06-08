const requiredKeys = [
  'annotation',
  'emoji',
  'emoticon',
  'group',
  'order',
  'shortcodes',
  'tags',
  'version'
]

export function assertEmojiBaseData (emojiBaseData) {
  if (!emojiBaseData ||
    !Array.isArray(emojiBaseData) ||
    !emojiBaseData[0] ||
    (typeof emojiBaseData[0] !== 'object') ||
    requiredKeys.some(key => (!(key in emojiBaseData[0])))) {
    throw new Error('Expected emojibase full (not compact) data, but data is in wrong format')
  }
}
