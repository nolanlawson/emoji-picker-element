import { requiredKeys } from './requiredKeys'

export function assertEmojiData (emojiData) {
  if (!emojiData ||
    !Array.isArray(emojiData) ||
    !emojiData[0] ||
    (typeof emojiData[0] !== 'object') ||
    requiredKeys.some(key => (!(key in emojiData[0])))) {
    throw new Error('Expected emojibase full (not compact) data, but data is in wrong format')
  }
}
