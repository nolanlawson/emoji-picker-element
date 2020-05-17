export function assertEmojiBaseData (emojiBaseData) {
  if (!emojiBaseData || !Array.isArray(emojiBaseData) ||
    !emojiBaseData.length || !emojiBaseData[0].emoji || !emojiBaseData[0].version) {
    throw new Error('Expected emojibase full (not compact) data, but data is in wrong format')
  }
}
