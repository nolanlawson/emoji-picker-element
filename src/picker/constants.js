export const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000 // 1 second
export const DEFAULT_SKIN_TONE_EMOJI = '🖐️'
export const DEFAULT_NUM_COLUMNS = 8

// Based on https://fivethirtyeight.com/features/the-100-most-used-emojis/ and
// https://blog.emojipedia.org/facebook-reveals-most-and-least-used-emojis/ with
// a bit of my own curation. (E.g. avoid the "OK" gesture because of connotations:
// https://emojipedia.org/ok-hand/)
export const MOST_COMMONLY_USED_EMOJI = [
  '😊',
  '😒',
  '♥️',
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

export const FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",' +
  '"Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif'

/* istanbul ignore next */
export const DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0
