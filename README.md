emoji-picker-element
====

A lightweight emoji picker, distributed as a custom element.

It's built on top of IndexedDB, so it consumes far less memory than other emoji pickers.
It also uses [Svelte](https://svelte.dev), so it has a minimal runtime footprint.

Design goals:

- Store emoji data in IndexedDB, not memory
- Render native emoji, no spritesheets
- Accessible
- Drop-in as a vanilla web component

## Install

    npm install emoji-picker-element

## Usage

```html
<emoji-picker></emoji-picker>
```

```js
import 'emoji-picker-element';
```

Then listen for `emoji-click` events:

```js
const element = document.querySelector('emoji-picker');
element.addEventListener('emoji-click', event => console.log(event.detail))
```

This will log:

```json
{
  "annotation": "grinning face",
  "group": 0,
  "order": 1,
  "shortcodes": [ "gleeful" ],
  "tags": [ "face", "grin" ],
  "tokens": [ ":d", "face", "gleeful", "grin", "grinning" ],
  "unicode": "😀",
  "version": 1,
  "emoticon": ":D"
}
```

## Styling

`emoji-picker-element` uses [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), so its inner styling cannot be changed with arbitrary CSS. Please refer to the API below for style customization.

### Size

`emoji-picker-element` has a default size, but you can change it to be whatever you want:

```css
emoji-picker {
  width: 400px;
  height: 300px;
}
```

For instance, to make it expand to fit whatever container you give it:

```css
emoji-picker {
  width: 100%;
  height: 100%;
}
```

### Dark mode

By default, `emoji-picker-element` will automatically switch to dark mode based on 
[`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme). 
For more fine-grained, control, add the class `dark` or `light` to force dark/light mode:

```html
<emoji-picker class="dark"></emoji-picker>
<emoji-picker class="light"></emoji-picker>
```

### CSS variables

Most colors and sizes can be styled with CSS variables. For example:

```css
emoji-picker {
  --num-columns: 6;
  --emoji-size: 3rem;
  --background: gray;
}
```

Here is a full list of options:

<!-- CSS variable options start -->

| Variable                     | Default    | Default (dark) | Description                                     |
| ---------------------------- | ---------- | -------------- | ----------------------------------------------- |
| `--background`               | `#fff`     | `#222`         |  Background of the entire `<emoji-picker>`      |
| `--border-color`             | `#e0e0e0`  | `#444`         |                                                 |
| `--button-active-background` | `#e6e6e6`  | `#555555`      |  Background of an active button                 |
| `--button-hover-background`  | `#d9d9d9`  | `#484848`      |  Background of a hovered button                 |
| `--emoji-padding`            | `0.5rem`   |                |                                                 |
| `--emoji-size`               | `1.375rem` |                |                                                 |
| `--indicator-color`          | `#385ac1`  | `#5373ec`      |  Color of the nav indicator                     |
| `--indicator-height`         | `3px`      |                |  Height of the nav indicator                    |
| `--input-border-color`       | `#999`     | `#ccc`         |                                                 |
| `--input-border-radius`      | `0.5rem`   |                |                                                 |
| `--input-border-size`        | `1px`      |                |                                                 |
| `--input-font-color`         | `#111`     | `#efefef`      |                                                 |
| `--input-font-size`          | `1rem`     |                |                                                 |
| `--input-line-height`        | `1.5`      |                |                                                 |
| `--input-padding`            | `0.25rem`  |                |                                                 |
| `--input-placeholder-color`  | `#999`     | `#ccc`         |                                                 |
| `--num-columns`              | `8`        |                |  How many columns to display in the emoji grid  |
| `--outline-color`            | `#999`     | `#fff`         |  Focus outline color                            |
| `--outline-size`             | `2px`      |                |  Focus outline width                            |

<!-- CSS variable options end -->

### Focus outline

For accessibility reasons, `emoji-picker-element` displays a prominent focus ring. If you want to hide the focus ring for non-keyboard users (e.g. mouse and touch only), then use the [focus-visible](https://github.com/WICG/focus-visible) polyfill, e.g.:

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

`emoji-picker-element` already ships with the proper CSS for both the `:focus_visible` standard and the polyfill.

## JavaScript API

### Picker

```js
import { Picker } from 'emoji-picker-element';
const picker = new Picker();
document.body.appendChild(picker);
```

`new Picker(options)` supports a few different options:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `dataSource` | String | `"https://cdn.jsdelivr.net/npm/emojibase-data@5/en/data.json"` | Where to fetch the emoji data from. Note that `emoji-picker-element` requires the full `data.json`, not `compact.json`. |
| `locale` | String | `"en"` | Locale, should map to the locales supported by `emojibase-data` |
| `i18n` | Object | See below | Strings to use for internationalization of the Picker itself, i.e. the text and `aria-label`s. Note that `emoji-picker-element` only ships with English by default. |

These values can also be set at runtime, e.g.:

```js
const picker = new Picker();
picker.dataSource = '/my-emoji.json';
```

#### i18n structure

Here is the default English `i81n` object (`"en"` locale):

<!-- i18n options start -->

```json
{
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
  },
  "categoriesLabel": "Categories",
  "emojiUnsupported": "Your browser does not support color emoji.",
  "loading": "Loading…",
  "networkError": "Could not load emoji. Try refreshing.",
  "regionLabel": "Emoji picker",
  "search": "Search",
  "searchResultsLabel": "Search results",
  "skinToneLabel": "Choose a skin tone"
}
```

<!-- i18n options end -->

Note that some of these strings are only visible to users of screen readers.
But you should still support them if you internationalize your app!

### Database

You can work with the database API separately, which allows you to query emoji the same
way that the picker does:

```js
import { Database } from 'emoji-picker-element';

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

If you want to import the `Database` without the `Picker`, or you want to code-split them separately, then do:

```js
import Picker from 'emoji-picker-element/picker';
import Database from 'emoji-picker-element/database';
```

The reason for this is that `Picker` automatically registers itself as a custom element, following [web component best practices](https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/). But this adds side effects, so bundlers like Webpack and Rollup do not tree-shake as well, unless the modules are imported from completely separate files.

## Data and offline

### Data source and JSON format

`emoji-picker-element` requires the _full_ [emojibase-data](https://github.com/milesj/emojibase) JSON file, not the "compact" one. If you would like to trim the JSON file down even further, then you can modify the JSON to only contain these keys:

```json
[
  "annotation", "emoji", "emoticon", "group", 
  "order", "shortcodes", "tags", "version"
]
```

You can fetch the emoji JSON file from wherever you want. However, it's recommended that your server expose an `ETag` header – if so, `emoji-picker-element` can avoid re-downloading the entire JSON file over and over again. Instead, it will fire off a `HEAD` request and just check the `ETag`.

If the server hosting the JSON file is not the same as the one containing the emoji picker, then cross-origin server will also need to expose `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: *`. (Note that `jsdelivr` already does this, which is why it is the default.)

Unfortunately [Safari does not support `Access-Control-Allow-Headers`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility), meaning that the `ETag` header will not be available cross-origin. In that case, `emoji-picker-element` will fall back to the less performant option. If you want to avoid this, host the JSON on the same server as your web app.

### Offline-first

`emoji-picker-element` uses a "stale while revalidate" strategy to update emoji data. In other words, it will use any existing data it finds in IndexedDB, and lazily update via the `dataSource` in case that data has changed. This means it will work [offline-first](http://offlinefirst.org/) the second time it runs.

If you would like to manage the database yourself (e.g. to ensure that it's correctly populated before displaying the `Picker`), then create a new `Database` instance and wait for its `ready()` promise to resolve:

```js
const database = new Database()
try {
  await database.ready()
} catch (err) {
  // Deal with any errors (e.g. offline)
}
```

If `emoji-picker-element` fails to fetch the JSON data the first time it loads, then it will display an error message.

## Design decisions

### IndexedDB

Why IndexedDB? Well, the [`emojibase-data`](https://github.com/milesj/emojibase) English JSON file is [854kB](https://unpkg.com/browse/emojibase-data@5.0.1/en/), and the "compact" version is still 543kB. That's a lot of data to keep in memory just for an emoji picker. And it's not as if that number is ever going down; the Unicode Consortium keeps adding more emoji every year.

Using IndexedDB has a few advantages:

1. We don't need to keep half a megabyte of emoji data in memory at all times.
2. The second time your visitors visit your website, we don't even need to download, parse, and index the emoji data, because it's already available on their hard drive.

### Native emoji

To avoid downloading a large sprite sheet (which may look out-of-place on different platforms, or may have IP issues), `emoji-picker-element` only renders native emoji. This means it is limited to the emoji actually installed on the user's device.

To avoid rendering ugly unsupported or half-supported emoji, `emoji-picker-element` will automatically detect emoji support and only render the supported characters. (So no empty boxes or awkward double emoji.)

### JSON loading

Why only allow loading via a URL rather than directly passing in a JSON object? A few reasons:

First, it bloats the size of the JavaScript bundle to do so. `emoji-picker-element` is optimized for second load, where
it doesn't even need to fetch, parse, or read the full JSON object into memory – it can just rely on IndexedDB.
Sure, this could be optional, but if an anti-pattern is allowed, then people might do it out of convenience.

Second, browsers deal with JSON more efficiently when it's loaded via `fetch()` rather than embedded in JavaScript. It's
[faster for the browser to parse JSON than JavaScript](https://joreteg.com/blog/improving-redux-state-transfer-performance),
plus using the `await (await fetch()).json()` pattern gives the browser more room for optimizations, since you're
explicitly telling it to cache and parse the data (asynchronously) as JSON. (I'm not aware of any browsers that do
this, e.g. off-main-thread JSON parsing, but it's certainly possible!)

### Browser support

`emoji-picker-element` only supports the latest versions of Chrome, Firefox, and Safari, as well as equivalent browsers (Edge, Opera, etc.).

## Contributing

Install

    yarn

Lint:

    yarn lint

Fix most lint issues:

    yarn lint:fix

Run the tests:

    yarn test

Check code coverage:

    yarn cover