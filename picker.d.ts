import { I18n, PickerConstructorOptions, EmojiPickerEventMap, CustomEmoji } from "./shared";
export default class Picker extends HTMLElement {
    dataSource: string;
    locale: string;
    i18n: I18n;
    skinToneEmoji: string;
    customEmoji?: CustomEmoji[];
    customCategorySorting?: (a: string, b: string) => number;
    /**
     *
     * @param dataSource - URL to fetch the emoji data from (`data-source` when used as an attribute)
     * @param locale - Locale string
     * @param i18n - i18n object (see below for details)
     * @param skinToneEmoji - The emoji to use for the skin tone picker (`skin-tone-emoji` when used as an attribute)
     * @param customEmoji - Array of custom emoji
     * @param customCategorySorting - Function to sort custom category strings (sorted alphabetically by default)
     */
    constructor({ dataSource, locale, i18n, skinToneEmoji, customEmoji, customCategorySorting }?: PickerConstructorOptions);

    addEventListener<K extends keyof EmojiPickerEventMap>(type: K, listener: (this: Picker, ev: EmojiPickerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof EmojiPickerEventMap>(type: K, listener: (this: Picker, ev: EmojiPickerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "emoji-picker": Picker;
    }
}
