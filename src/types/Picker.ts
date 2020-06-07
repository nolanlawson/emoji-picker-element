import {PickerConstructorOptions} from "./shared";

export default class Picker extends HTMLElement {

  /**
   *
   * @param dataSource - URL to fetch the emojibase data from
   * @param locale - Locale string
   * @param i18n - i18n object (see below for details)
   */
  constructor({
                dataSource = 'https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json',
                locale = 'en',
                i18n = {}
              }: PickerConstructorOptions = {}) {
    super()
  }
}

// see https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/
declare global {
  interface HTMLElementTagNameMap {
    "emoji-picker": Picker,
  }
}