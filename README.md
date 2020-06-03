lite-emoji-picker
====

A small, performant, accessible emoji picker, distributed as a web component.

It's built on top of IndexedDB, so it consumes far less memory than other emoji pickers. It also uses [Svelte](https://svelte.dev), so it has a minimal runtime footprint.

Design goals:

- Store emoji data in IndexedDB, not memory
- Render native emoji, no spritesheets
- Accessible by default
- Drop-in as a vanilla web component

## Install

    npm install lite-emoji-picker

## Usage

```html
<lite-emoji-picker></lite-emoji-picker>
```

```js
import 'lite-emoji-picker';
```

`lite-emoji-picker` will expand to fit whatever container you give it. Here is a good default:

```css
lite-emoji-picker {
  width: 400px;
  height: 300px;
}
```

`lite-emoji-picker` uses Shadow DOM, so its inner styling is not accessible except via the API.

## API

### Picker

```js
import { Picker } from 'lite-emoji-picker';
const picker = new Picker();
document.body.appendChild(picker);
```

`new Picker(options)` supports a few different options:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `dataSource` | String | `"https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json"` | Where to fetch the emoji data from. Note that `lite-emoji-picker` requires the full `data.json`, not `compact.json`. |
| `locale` | String | `"en"` | Locale, should map to the locales supported by `emojibase-data` |
| `i18n` | Object | See below | Strings to use for internationalization of the Picker itself, i.e. the text and `aria-label`s. Note that `lite-emoji-picker` only ships with English by default. |

These values can also be set at runtime, e.g.:

```js
const picker = new Picker();
picker.numColumns = 6;
```

#### i18n structure

Note that some of these values are only visible to users of screen readers (but you should still support them if you internationalize your app!).

```json
{
  "loading": "Loading…",
  "regionLabel": "Emoji picker",
  "search": "Search",
  "categoriesLabel": "Categories",
  "categories": {
    "smileys-emotion": "Smileys and emoticons",
    "people-body": "People and body",
    "animals-nature": "Animals and nature",
    "food-drink": "Food and drink",
    "travel-places": "Travel and places",
    "activities": "Activities",
    "objects": "Objects",
    "symbols": "Symbols",
    "flags": "Flags"
  }
}
```

#### Styling

##### Dark mode

By default, `lite-emoji-picker` will automatically switch to dark mode based on [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme). For more fine-grained, control, add the class `dark` or `light` to force dark/light mode:

```html
<lite-emoji-picker class="dark"></lite-emoji-picker>
<lite-emoji-picker class="light"></lite-emoji-picker>
```

###### CSS variables

Many attributes such as colors and sizes can be styled with CSS variables. Here is a list:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| --lep-num-columns | integer | 8 | Number of emoji to show per row |

For example:

```css
lite-emoji-picker {
  --lep-num-columns: 6;
  --lep-emoji-size: 3rem;
  --lep-background-color: gray;
}
```

### Database

You can work with the database API separately:

```js
import { Database } from 'lite-emoji-picker';

const database = new Database();
await database.getEmojiBySearchPrefix('elephant'); // [{unicode: "🐘", ...}]
```

`new Database()` takes similar options as the picker:

```js
const database = new Database({
  locale: 'en',
  dataSource: 'https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json'
});
```

In general, it's not a problem to create multiple `Database` objects with the same arguments. Under the hood, they will share the same IndexedDB connection.

<!-- TODO: Database API here -->

### Tree-shaking

If you want to import the `Database` without the `Picker`, or you want to import them separately, then do:

```js
import Picker from 'lite-emoji-picker/dist/es/Picker.js';
import Database from 'lite-emoji-picker/dist/es/Database.js';
```

The reason for this is that `Picker` automatically registers itself as a custom element, following [web component best practices](https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/). But this adds side effects, so bundlers do not tree-shake as well unless the modules are imported from completely separate files.

## Focus outline

By default, `lite-emoji-picker` displays a prominent focus ring for accessibility reasons. If you want to hide the focus ring for non-keyboard users (e.g. mouse and touch only), then use the [focus-visible](https://github.com/WICG/focus-visible) polyfill, e.g.:

```css
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}
```

```js
import { applyFocusVisiblePolyfill } from 'focus-visible';

const picker = new Picker();
applyFocusVisiblePolyfill(picker.shadowRoot);
```

`lite-emoji-picker` already ships with the proper CSS for both the `:focus_visible` standard and the polyfill.

## Data and offline

### Data source and JSON format

You can fetch the emoji JSON file from wherever you want. However, it's recommended that your server expose an `ETag` header. If so, `lite-emoji-picker` can avoid re-downloading the entire JSON file over and over again. Instead, it will fire off a `HEAD` request and just check the `ETag`.

If your server is cross-origin, then it will also need to expose `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: *`. (Note that `jsdelivr` already does this, which is why it is the default.)

`lite-emoji-picker` requires the _full_ [emojibase-data](https://github.com/milesj/emojibase) JSON file, not the "compact" one. If you would like to trim the JSON file down even further, then modify the file to only contain these keys:

```json
[
  "annotation", "emoji", "emoticon", "group", 
  "order", "shortcodes", "tags", "version"
]
```

### Offline-first

By default, `lite-emoji-picker` will use the "stale while revalidate" strategy the second time it loads. In other words, it will use any existing data it finds in IndexedDB, and lazily update via the `dataSource` in case data has changed. This means it will work offline-first the second time it runs.

If you would like to manage the database yourself (e.g. to ensure that it's correctly populated before displaying the `Picker`), then create a new `Database` instance and wait for its `ready()` promise to resolve:

```js
const database = new Database()
try {
  await database.ready()
} catch (err) {
  // Deal with any errors (e.g. offline)
}
```

If `lite-emoji-picker` fails to fetch the JSON data the first time it loads, then it will display no emoji.

## Design decisions

### IndexedDB

The [`emojibase-data`](https://github.com/milesj/emojibase) English JSON file is [854kB](https://unpkg.com/browse/emojibase-data@5.0.1/en/), and the "compact" version is still 543kB. That's a lot of data to keep in memory just for an emoji picker. And it's not like that number is ever going down; the Unicode Consortium keeps adding more emoji every year.

Using IndexedDB has a few advantages:

1. We don't need to keep half a megabyte of emoji data in memory at all times.
2. The second time your visitors visit your website, we don't even need to download, parse, and index the emoji data, because it's already available on their hard drive.

### Native emoji

To avoid downloading a large sprite sheet (which may be copyrighted, or may look out-of-place on different platforms), `lite-emoji-picker` only renders native emoji. This means it is limited to the emoji actually installed on the user's device.

To avoid rendering ugly unsupported or half-supported emoji, `lite-emoji-picker` will automatically detect emoji support and only render the supported characters. (So no empty boxes or awkward double emoji.)

### Browser support

Only the latest versions of Chrome, Firefox, and Safari (and browsers using equivalent rendering engines) are supported.

## Contributing

Install

    yarn

Run the tests:

    yarn test