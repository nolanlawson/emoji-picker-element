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
  i18n?: object
}