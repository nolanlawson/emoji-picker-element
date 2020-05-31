import { determineEmojiSupportLevel } from '../../utils/determineEmojiSupportLevel'
// Check which emojis we know for sure aren't supported, based on Unicode version level
export const emojiSupportLevel = determineEmojiSupportLevel()
// determine which emojis containing ZWJ (zero width joiner) characters
// are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
export const supportedZwjEmojis = new Map()

console.log('emoji support level', emojiSupportLevel)