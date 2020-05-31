lite-emoji-picker
====

A small, performant, accessible emoji picker and lookup library, distributed as a web component.

Built on top of IndexedDB so it consumes far less memory then other emoji pickers. Suitable for mobile web apps or other resource-constrained environments.

Design goals:

- Store emoji in IndexedDB, not memory
- Use IndexedDB for querying
- Render native emoji

## Install

    npm install lite-emoji-picker

```js
import { Picker } from 'lite-emoji-picker'
customElements.define('emoji-picker', Picker)
document.body.appendChild(new Picker())
```

## API

`new Picker(options)` supports a few different options:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `locale` | String | `"en"` | Locale, should map to the locales supported by `emojibase-data` |
| `dataSource` | String | `"https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json"` | Where to fetch the emoji data from. Note that `lite-emoji-picker` requires the full `data.json`, not `compact.json`. |
| `i18n` | Object | See below | Strings to use for i18n in the Picker itself, i.e. the text and `aria-label`s.
| `numColumns` | number | `8` | Number of emoji to show per row. |
| `darkMode` | boolean/String | `"auto"` | Dark mode. Either `false`, `true`, or `"auto"`. `"auto"` chooses based on [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

## Design decisions

### IndexedDB

The [`emojibase-data`](https://github.com/milesj/emojibase) English JSON file is [854kB](https://unpkg.com/browse/emojibase-data@5.0.1/en/). The "compact" version is still 543kB. That's a lot of data to keep in memory just for an emoji picker. And it's not like that number is ever going down; the Unicode Consortium keeps adding more emoji every year.

Using IndexedDB has a few advantages:

1. We don't need to keep half a megabyte of emoji data in memory at all times.
2. The second time your visitors visit your website, we don't even need to download, parse, and index the emoji data, because it's already available on their hard drive.

### Native emoji

To avoid downloading a large sprite sheet (or deal with potential IP issues), `lite-emoji-picker` only renders native emoji. This means it is limited to the emoji actually installed on the user's device.

To avoid rendering ugly unsupported or half-supported emoji, `lite-emoji-picker` will detect emoji support and only render the supported characters. (So no empty boxes or double-width characters.)