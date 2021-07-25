export declare enum SkinTone {
    Default = 0,
    Light = 1,
    MediumLight = 2,
    Medium = 3,
    MediumDark = 4,
    Dark = 5
}
export interface NativeEmoji {
    annotation: string;
    emoticon?: string;
    group: number;
    name: string;
    order: number;
    shortcodes?: string[];
    tags?: string[];
    version: number;
    unicode: string;
    skins?: EmojiSkin[];
}
export interface EmojiSkin {
    tone: SkinTone;
    unicode: string;
    version: number;
}
export interface DatabaseConstructorOptions {
    dataSource?: string;
    locale?: string;
    customEmoji?: CustomEmoji[];
}
export interface PickerConstructorOptions {
    dataSource?: string;
    locale?: string;
    i18n?: I18n;
    skinToneEmoji?: string;
    customEmoji?: CustomEmoji[];
    customCategorySorting?: (a: string, b: string) => number;
}
export interface I18n {
    emojiUnsupportedMessage: string;
    loadingMessage: string;
    networkErrorMessage: string;
    regionLabel: string;
    searchLabel: string;
    skinToneLabel: string;
    searchResultsLabel: string;
    categoriesLabel: string;
    categories: I18nCategories;
    skinTonesLabel: string;
    skinTones: string[];
    searchDescription: string;
    skinToneDescription: string;
    favoritesLabel: string;
}
export interface I18nCategories {
    custom: string;
    'smileys-emotion': string;
    'people-body': string;
    'animals-nature': string;
    'food-drink': string;
    'travel-places': string;
    activities: string;
    objects: string;
    symbols: string;
    flags: string;
}
export interface EmojiClickEventDetail {
    emoji: Emoji;
    skinTone: SkinTone;
    unicode?: string;
    name?: string;
}
export interface SkinToneChangeEventDetail {
    skinTone: SkinTone;
}
declare type Modify<T, R> = Omit<T, keyof R> & R;
export declare type EmojiClickEvent = Modify<UIEvent, {
    detail: EmojiClickEventDetail;
}>;
export declare type SkinToneChangeEvent = Modify<UIEvent, {
    detail: SkinToneChangeEventDetail;
}>;
export interface EmojiPickerEventMap {
    "emoji-click": EmojiClickEvent;
    "skin-tone-change": SkinToneChangeEvent;
}
export interface CustomEmoji {
    name: string;
    shortcodes?: string[];
    url: string;
    category?: string;
}
export declare type Emoji = NativeEmoji | CustomEmoji;
export {};
