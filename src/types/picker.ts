import {I18n, PickerConstructorOptions, EmojiPickerEventMap, CustomEmoji} from "./shared";

export default class Picker extends HTMLElement {
  dataSource: string
  locale: string
  i18n: I18n
  skinToneEmoji: string
  customEmoji?: CustomEmoji[]
  customCategorySorting?: (a: string, b: string) => number

  /**
   *
   * @param dataSource - URL to fetch the emojibase data from (`data-source` when used as an attribute)
   * @param locale - Locale string
   * @param i18n - i18n object (see below for details)
   * @param skinToneEmoji - The emoji to use for the skin tone picker (`skin-tone-emoji` when used as an attribute)
   * @param customEmoji - Array of custom emoji
   * @param customCategorySorting - Function to sort custom category strings (sorted alphabetically by default)
   */
  constructor({
                dataSource = 'https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json',
                locale = 'en',
                i18n,
                skinToneEmoji = '🖐️',
                customEmoji,
                customCategorySorting
              }: PickerConstructorOptions = {}) {
    super()
  }

  // Adding types for addEventListener is hard... I basically just copy-pasted this from lib.dom.d.ts. Not sure
  // Why I need the @ts-ignore
  addEventListener<K extends keyof EmojiPickerEventMap>(type: K, listener: (this: TextTrackCue, ev: EmojiPickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void
  // @ts-ignore
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
}

// see https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/
declare global {
  interface HTMLElementTagNameMap {
    "emoji-picker": Picker,
  }
}