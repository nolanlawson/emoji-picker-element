export interface Emoji {
  annotation: string;
  emoticon?: string;
  group: number;
  name: string;
  order: number;
  shortcodes: string[];
  tags?: string[];
  version: number;
  unicode: string;
}

export interface DatabaseConstructorOptions {
  dataSource?: string,
  locale?: string
}

export interface PickerConstructorOptions {
  dataSource?: string,
  locale?: string,
  i18n?: I18n
}

export interface I18n {
  emojiUnsupported: string,
  loading: string,
  networkError: string,
  regionLabel: string,
  search: string,
  skinToneLabel: string,
  searchResultsLabel: string,
  categoriesLabel: string,
  categories: I18nCategories
}

export interface I18nCategories {
  'smileys-emotion': string,
  'people-body': string,
  'animals-nature': string,
  'food-drink': string,
  'travel-places': string,
  activities: string,
  objects: string,
  symbols: string,
  flags: string
}