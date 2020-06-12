export enum SkinTone {
  Default = 0,
  Light = 1,
  MediumLight = 2,
  Medium = 3,
  MediumDark = 4,
  Dark = 5
}

export interface Emoji {
  annotation: string
  emoticon?: string
  group: number
  name: string
  order: number
  shortcodes: string[]
  tags?: string[]
  version: number
  unicode: string
  skins?: EmojiSkin[]
}

export interface EmojiSkin {
  tone: SkinTone
  unicode: string
  version: number
}

export interface DatabaseConstructorOptions {
  dataSource?: string
  locale?: string
}

export interface PickerConstructorOptions {
  dataSource?: string
  locale?: string
  i18n?: I18n
}

export interface I18n {
  emojiUnsupported: string
  loading: string
  networkError: string
  regionLabel: string
  search: string
  skinToneLabel: string
  searchResultsLabel: string
  categoriesLabel: string
  categories: I18nCategories
  skinTonesTitle: string
  skinTones: string[]
  searchDescription: string
  skinToneDescription: string
}

export interface I18nCategories {
  'smileys-emotion': string
  'people-body': string
  'animals-nature': string
  'food-drink': string
  'travel-places': string
  activities: string
  objects: string
  symbols: string
  flags: string
}

export interface EmojiClickEventDetail {
  emoji: Emoji,
  skinTone: SkinTone,
  unicode: string,
}

export interface SkinToneChangeEventDetail {
  skinTone: SkinTone
}

// via https://stackoverflow.com/a/55032655/680742
type Modify<T, R> = Omit<T, keyof R> & R;

export type EmojiClickEvent = Modify<UIEvent, {
  detail: EmojiClickEventDetail
}>

export type SkinToneChangeEvent = Modify<UIEvent, {
  detail: SkinToneChangeEventDetail
}>

export interface EmojiPickerEventMap {
  "emoji-click": EmojiClickEvent;
  "skin-tone-change": SkinToneChangeEvent;
}