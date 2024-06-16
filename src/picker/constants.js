export const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000 // 1 second
export const DEFAULT_SKIN_TONE_EMOJI = '🖐️'

// Based on https://fivethirtyeight.com/features/the-100-most-used-emojis/ and
// https://blog.emojipedia.org/facebook-reveals-most-and-least-used-emojis/ with
// a bit of my own curation. (E.g. avoid the "OK" gesture because of connotations:
// https://emojipedia.org/ok-hand/)
export const MOST_COMMONLY_USED_EMOJI = [
  '😊',
  '😒',
  '❤️',
  '👍️',
  '😍',
  '😂',
  '😭',
  '☺️',
  '😔',
  '😩',
  '😏',
  '💕',
  '🙌',
  '😘'
]

// It's important to list Twemoji Mozilla before everything else, because Mozilla bundles their
// own font on some platforms (notably Windows and Linux as of this writing). Typically, Mozilla
// updates faster than the underlying OS, and we don't want to render older emoji in one font and
// newer emoji in another font:
// https://github.com/nolanlawson/emoji-picker-element/pull/268#issuecomment-1073347283
export const FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",' +
  '"Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif'

/* istanbul ignore next */
export const DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0
