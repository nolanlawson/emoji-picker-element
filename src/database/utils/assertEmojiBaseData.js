export function assertEmojiBaseData (emojiBaseData) {
  if (!emojiBaseData || !Array.isArray(emojiBaseData) || !emojiBaseData.length || !emojiBaseData[0].unicode) {
    throw new Error('Expected emojibase data, but data is in wrong format')
  }
}
