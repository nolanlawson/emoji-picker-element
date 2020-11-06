emoji-picker-element [![Build Status](https://travis-ci.com/nolanlawson/emoji-picker-element.svg?branch=master)](https://travis-ci.com/nolanlawson/emoji-picker-element)
====

![Screenshot of emoji-picker-element in light and dark modes](https://nolanwlawson.files.wordpress.com/2020/06/out.png)

```html
<emoji-picker></emoji-picker>
```

A lightweight emoji picker, distributed as a web component.

**Features:**

- Supports [Emoji v13](https://emojipedia.org/emoji-13.0/) (depending on OS) and custom emoji
- Uses IndexedDB, so it consumes [far less memory](https://nolanlawson.com/2020/06/28/introducing-emoji-picker-element-a-memory-efficient-emoji-picker-for-the-web/) than other emoji pickers
- [Small bundle size](https://bundlephobia.com/result?p=emoji-picker-element) (41kB minified, ~14.4kB gzipped)
- Renders native emoji only, no spritesheets
- Accessible by default
- Framework and bundler not required, just add a `<script>` tag and use it

**Table of contents:**

<!-- toc start -->

- [emoji-picker-element](#emoji-picker-element-)
  * [Usage](#usage)
    + [Examples](#examples)
  * [Styling](#styling)
    + [Size](#size)
    + [Dark mode](#dark-mode)
    + [CSS variables](#css-variables)
    + [Focus outline](#focus-outline)
    + [Custom styling](#custom-styling)
  * [JavaScript API](#javascript-api)
    + [Picker](#picker)
      - [i18n structure](#i18n-structure)
      - [Custom category order](#custom-category-order)
    + [Database](#database)
      - [Constructors](#constructors)
        * [constructor](#constructor)
      - [Accessors](#accessors)
        * [customEmoji](#customemoji)
      - [Methods](#methods)
        * [close](#close)
        * [delete](#delete)
        * [getEmojiByGroup](#getemojibygroup)
        * [getEmojiBySearchQuery](#getemojibysearchquery)
        * [getEmojiByShortcode](#getemojibyshortcode)
        * [getEmojiByUnicodeOrName](#getemojibyunicodeorname)
        * [getPreferredSkinTone](#getpreferredskintone)
        * [getTopFavoriteEmoji](#gettopfavoriteemoji)
        * [incrementFavoriteEmojiCount](#incrementfavoriteemojicount)
        * [ready](#ready)
        * [setPreferredSkinTone](#setpreferredskintone)
    + [Events](#events)
      - [`emoji-click`](#emoji-click)
      - [`skin-tone-change`](#skin-tone-change)
    + [Custom emoji](#custom-emoji)
    + [Tree-shaking](#tree-shaking)
    + [Within a Svelte project](#within-a-svelte-project)
  * [Data and offline](#data-and-offline)
    + [Data source and JSON format](#data-source-and-json-format)
    + [Shortcodes](#shortcodes)
    + [Cache performance](#cache-performance)
    + [emojibase-data compatibility (deprecated)](#emojibase-data-compatibility-deprecated)
    + [Trimming the emoji data (deprecated)](#trimming-the-emoji-data-deprecated)
    + [Offline-first](#offline-first)
    + [Environments without IndexedDB](#environments-without-indexeddb)
  * [Design decisions](#design-decisions)
    + [IndexedDB](#indexeddb)
    + [Native emoji](#native-emoji)
    + [JSON loading](#json-loading)
    + [Browser support](#browser-support)
  * [Contributing](#contributing)

<!-- toc end -->

## Usage

Via npm:

    npm install emoji-picker-element

```js
import 'emoji-picker-element';
```

Or as a `<script>` tag:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js"></script>
```

Then use the HTML:

```html
<emoji-picker></emoji-picker>
```

And listen for `emoji-click` events:

```js
document.querySelector('emoji-picker')
  .addEventListener('emoji-click', event => console.log(event.detail));
```

This will log:

```json
{
  "emoji": {
    "annotation": "grinning face",
    "group": 0,
    "order": 1,
    "shortcodes": [ "grinning_face", "grinning" ],
    "tags": [ "face", "grin" ],
    "unicode": "😀",
    "version": 1,
    "emoticon": ":D"
  },
  "skinTone": 0,
  "unicode": "😀"
}
```

### Examples

- [Demo](https://nolanlawson.github.io/emoji-picker-element)
- [Button with tooltip/popover](https://bl.ocks.org/nolanlawson/781e7084e4c17acb921357489d51a5b0)

## Styling

`emoji-picker-element` uses [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), so its inner styling cannot be (easily) changed with arbitrary CSS. Refer to the API below for style customization.

### Size

`emoji-picker-element` has a default size, but you can change it to whatever you want:

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
Or you can add the class `dark` or `light` to force dark/light mode:

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

| Variable                     | Default    | Default (dark) | Description                                   |
| ---------------------------- | ---------- | -------------- | --------------------------------------------- |
| `--background`               | `#fff`     | `#222`         | Background of the entire `<emoji-picker>`     |
| `--border-color`             | `#e0e0e0`  | `#444`         |                                               |
| `--border-size`              | `1px`      |                | Width of border used in most of the picker    |
| `--button-active-background` | `#e6e6e6`  | `#555555`      | Background of an active button                |
| `--button-hover-background`  | `#d9d9d9`  | `#484848`      | Background of a hovered button                |
| `--category-font-color`      | `#111`     | `#efefef`      | Font color of custom emoji category headings  |
| `--category-font-size`       | `1rem`     |                | Font size of custom emoji category headings   |
| `--emoji-padding`            | `0.5rem`   |                |                                               |
| `--emoji-size`               | `1.375rem` |                |                                               |
| `--indicator-color`          | `#385ac1`  | `#5373ec`      | Color of the nav indicator                    |
| `--indicator-height`         | `3px`      |                | Height of the nav indicator                   |
| `--input-border-color`       | `#999`     | `#ccc`         |                                               |
| `--input-border-radius`      | `0.5rem`   |                |                                               |
| `--input-border-size`        | `1px`      |                |                                               |
| `--input-font-color`         | `#111`     | `#efefef`      |                                               |
| `--input-font-size`          | `1rem`     |                |                                               |
| `--input-line-height`        | `1.5`      |                |                                               |
| `--input-padding`            | `0.25rem`  |                |                                               |
| `--input-placeholder-color`  | `#999`     | `#ccc`         |                                               |
| `--num-columns`              | `8`        |                | How many columns to display in the emoji grid |
| `--outline-color`            | `#999`     | `#fff`         | Focus outline color                           |
| `--outline-size`             | `2px`      |                | Focus outline width                           |
| `--skintone-border-radius`   | `1rem`     |                | border radius of the skintone dropdown        |

<!-- CSS variable options end -->

### Focus outline

For accessibility reasons, `emoji-picker-element` displays a prominent focus ring. If you want to hide the focus ring for non-keyboard users (e.g. mouse and touch only), then use the [focus-visible](https://github.com/WICG/focus-visible) polyfill, e.g.:

```js
import 'focus-visible';

const picker = new Picker();
applyFocusVisiblePolyfill(picker.shadowRoot);
```

`emoji-picker-element` already ships with the proper CSS for both the `:focus-visible` standard and the polyfill.

### Custom styling

If you absolutely must go beyond the styling API above, you can do something like this:

```js
const style = document.createElement('style');
style.textContent = `/* custom shadow dom styles here */`
picker.shadowRoot.appendChild(style);
```

## JavaScript API

### Picker

Basic usage:

```js
import { Picker } from 'emoji-picker-element';
const picker = new Picker();
document.body.appendChild(picker);
```

The `new Picker(options)` constructor supports several options:

<!-- picker API start -->

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`customCategorySorting` | function | - | Function to sort custom category strings (sorted alphabetically by default)  |
`customEmoji` | CustomEmoji[] | - | Array of custom emoji |
`dataSource` | string | "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json" | URL to fetch the emoji data from (`data-source` when used as an attribute) |
`i18n` | I18n | - | i18n object (see below for details) |
`locale` | string | "en" | Locale string |
`skinToneEmoji` | string | "🖐️" | The emoji to use for the skin tone picker (`skin-tone-emoji` when used as an attribute) |



<!-- picker API end -->

For instance:

```js
const picker = new Picker({
  locale: 'fr',
  dataSource: '/fr-emoji.json'
})
```

These values can also be set at runtime:

```js
const picker = new Picker();
picker.dataSource = '/my-emoji.json';
```

Some values can also be set as declarative attributes:

```html
<emoji-picker
  locale="fr"
  data-source="/fr-emoji.json"
  skin-tone-emoji="✌"
></emoji-picker>
```

Note that complex properties like `i18n` or `customEmoji` are not supported as attributes, because the DOM only
supports string attributes, not complex objects.

#### i18n structure

Here is the default English `i18n` object (`"en"` locale):

<!-- i18n options start -->

```json
{
  "categories": {
    "custom": "Custom",
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
  "emojiUnsupportedMessage": "Your browser does not support color emoji.",
  "favoritesLabel": "Favorites",
  "loadingMessage": "Loading…",
  "networkErrorMessage": "Could not load emoji. Try refreshing.",
  "regionLabel": "Emoji picker",
  "searchDescription": "When search results are available, press up or down to select and enter to choose.",
  "searchLabel": "Search",
  "searchResultsLabel": "Search results",
  "skinToneDescription": "When expanded, press up or down to select and enter to choose.",
  "skinToneLabel": "Choose a skin tone (currently {skinTone})",
  "skinTones": [
    "Default",
    "Light",
    "Medium-Light",
    "Medium",
    "Medium-Dark",
    "Dark"
  ],
  "skinTonesLabel": "Skin tones"
}
```

<!-- i18n options end -->

Note that some of these strings are only visible to users of screen readers.
But you should still support them if you internationalize your app!

#### Custom category order

By default, custom categories are sorted alphabetically. To change this, pass in your own `customCategorySorting`:

```js
picker.customCategorySorting = (category1, category2) => { /* your sorting code */ };
```

This function should accept two strings and return a number.

Custom emoji with no category will pass in `undefined`. By default, these are shown first, with the label `"Custom"`
(determined by `i18n.categories.custom`).

### Database

You can work with the database API separately, which allows you to query emoji the same
way that the picker does:

```js
import { Database } from 'emoji-picker-element';

const database = new Database();
await database.getEmojiBySearchPrefix('elephant'); // [{unicode: "🐘", ...}]
```

Note that under the hood, IndexedDB data is partitioned based on the `locale`. So if you create two `Database`s with two different `locale`s, it will store twice as much data.

Full API:

<!-- database API start -->

#### Constructors

#####  constructor

\+ **new Database**(`__namedParameters`: object): *Database*

Create a new Database.

Note that multiple Databases pointing to the same locale will share the
same underlying IndexedDB connection and database.

**Parameters:**

▪`Default value`  **__namedParameters**: *object*= {}

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`customEmoji` | CustomEmoji[] | [] | Array of custom emoji  |
`dataSource` | string | "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json" | URL to fetch the emoji data from |
`locale` | string | "en" | Locale string |

**Returns:** *Database*

#### Accessors

#####  customEmoji

• **get customEmoji**(): *CustomEmoji[]*

Return the custom emoji associated with this Database, or the empty array if none.

**Returns:** *CustomEmoji[]*

• **set customEmoji**(`customEmoji`: CustomEmoji[]): *void*

Set the custom emoji for this database. Throws an error if custom emoji are not in the correct format.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`customEmoji` | CustomEmoji[] |   |

**Returns:** *void*

#### Methods

#####  close

▸ **close**(): *Promise‹void›*

Closes the underlying IndexedDB connection. The Database is not usable after that (or any other Databases
with the same locale).

Note that as soon as any other non-close/delete method is called, the database will automatically reopen.

**Returns:** *Promise‹void›*

___

#####  delete

▸ **delete**(): *Promise‹void›*

Deletes the underlying IndexedDB database. The Database is not usable after that (or any other Databases
with the same locale).

Note that as soon as any other non-close/delete method is called, the database will be recreated.

**Returns:** *Promise‹void›*

___

#####  getEmojiByGroup

▸ **getEmojiByGroup**(`group`: number): *Promise‹NativeEmoji[]›*

Returns all emoji belonging to a group, ordered by `order`. Only returns native emoji;
custom emoji don't belong to a group.

Non-numbers throw an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`group` | number | the group number  |

**Returns:** *Promise‹NativeEmoji[]›*

___

#####  getEmojiBySearchQuery

▸ **getEmojiBySearchQuery**(`query`: string): *Promise‹Emoji[]›*

Returns all emoji matching the given search query, ordered by `order`.

Empty/null strings throw an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`query` | string | search query string  |

**Returns:** *Promise‹Emoji[]›*

___

#####  getEmojiByShortcode

▸ **getEmojiByShortcode**(`shortcode`: string): *Promise‹Emoji | null›*

Return a single emoji matching the shortcode, or null if not found.

The colons around the shortcode should not be included when querying, e.g.
use "slight_smile", not ":slight_smile:". Uppercase versus lowercase
does not matter. Empty/null strings throw an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`shortcode` | string |   |

**Returns:** *Promise‹Emoji | null›*

___

#####  getEmojiByUnicodeOrName

▸ **getEmojiByUnicodeOrName**(`unicodeOrName`: string): *Promise‹Emoji | null›*

Return a single native emoji matching the unicode string, or
a custom emoji matching the name, or null if not found.

In the case of native emoji, the unicode string can be either the
main unicode string, or the unicode of one of the skin tone variants.

Empty/null strings throw an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`unicodeOrName` | string | unicode (native emoji) or name (custom emoji)  |

**Returns:** *Promise‹Emoji | null›*

___

#####  getPreferredSkinTone

▸ **getPreferredSkinTone**(): *Promise‹SkinTone›*

Get the user's preferred skin tone. Returns 0 if not found.

**Returns:** *Promise‹SkinTone›*

___

#####  getTopFavoriteEmoji

▸ **getTopFavoriteEmoji**(`limit`: number): *Promise‹Emoji[]›*

Get the top favorite emoji in descending order. If there are no favorite emoji yet, returns an empty array.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`limit` | number | maximum number of results to return  |

**Returns:** *Promise‹Emoji[]›*

___

#####  incrementFavoriteEmojiCount

▸ **incrementFavoriteEmojiCount**(`unicodeOrName`: string): *Promise‹void›*

Increment the favorite count for an emoji by one. The unicode string must be non-empty. It should
correspond to the base (non-skin-tone) unicode string from the emoji object, or in the case of
custom emoji, it should be the name.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`unicodeOrName` | string | unicode of a native emoji, or name of a custom emoji  |

**Returns:** *Promise‹void›*

___

#####  ready

▸ **ready**(): *Promise‹void›*

Resolves when the Database is ready, or throws an error if
the Database could not initialize.

Note that you don't need to do this before calling other APIs – they will
all wait for this promise to resolve before doing anything.

**Returns:** *Promise‹void›*

___

#####  setPreferredSkinTone

▸ **setPreferredSkinTone**(`skinTone`: SkinTone): *Promise‹void›*

Set the user's preferred skin tone. Non-numbers throw an error.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`skinTone` | SkinTone | preferred skin tone  |

**Returns:** *Promise‹void›*


<!-- database API end -->

### Events

#### `emoji-click`

The `emoji-click` event is fired when an emoji is selected by the user. Example format:

```javascript
{
  emoji: {
    annotation: 'thumbs up',
    group: 1,
    order: 280,
    shortcodes: ['thumbsup', '+1', 'yes'],
    tags: ['+1', 'hand', 'thumb', 'up'],
    unicode: '👍️',
    version: 0.6,
    skins: [
      { tone: 1, unicode: '👍🏻', version: 1 },
      { tone: 2, unicode: '👍🏼', version: 1 },
      { tone: 3, unicode: '👍🏽', version: 1 },
      { tone: 4, unicode: '👍🏾', version: 1 },
      { tone: 5, unicode: '👍🏿', version: 1 }
    ]
  },
  skinTone: 4,
  unicode: '👍🏾'
}
```

And usage:

```js
picker.addEventListener('emoji-click', event => {
  console.log(event.detail); // will log something like the above
});
```

Note that `unicode` will represent whatever the emoji should look like
with the given `skinTone`. If the `skinTone` is 0, or if the emoji has
no skin tones, then no skin tone is applied to `unicode`.

#### `skin-tone-change`

This event is fired whenever the user selects a new skin tone. Example format:

```js
{
  skinTone: 5
}
```

And usage:

```js
picker.addEventListener('skin-tone-change', event => {
  console.log(event.detail); // will log something like the above
})
```

Note that skin tones are an integer from 0 (default) to 1 (light) through 5 (dark).

### Custom emoji

Both the Picker and the Database support custom emoji. Unlike regular emoji, custom emoji
are kept in-memory. (It's assumed that they're small, and they might frequently change, so
there's not much point in storing them in IndexedDB.)

Custom emoji should follow the format:

```js
[
  {
    name: 'Garfield',
    shortcodes: ['garfield'],
    url: 'http://example.com/garfield.png',
    category: 'Cats'
  },
  {
    name: 'Heathcliff',
    shortcodes: ['heathcliff'],
    url: 'http://example.com/heathcliff.png',
    category: 'Cats'
  },
  {
    name: 'Scooby-Doo',
    shortcodes: ['scooby'],
    url: 'http://example.com/scooby.png',
    category: 'Dogs'
  }  
]
```

Note that names are assumed to be unique (case-insensitive), and it's assumed that the `shortcodes` have at least one entry.

The `category` is optional. If you don't provide it, then the custom emoji will appear in a
single category called "Custom".

To pass custom emoji into the `Picker`:

```js
const picker = new Picker({
  customEmoji: [ /* ... */ ]
});
```

Or the `Database`:

```js
const database = new Database({
  customEmoji: [ /* ... */ ]
});
```

Custom emoji can also be set at runtime:

```js
picker.customEmoji = [ /* ... */ ];
database.customEmoji = [ /* ... */ ];
```

### Tree-shaking

If you want to import the `Database` without the `Picker`, or you want to code-split them separately, then do:

```js
import Picker from 'emoji-picker-element/picker';
import Database from 'emoji-picker-element/database';
```

The reason for this is that `Picker` automatically registers itself as a custom element, following [web component best practices](https://justinfagnani.com/2019/11/01/how-to-publish-web-components-to-npm/). But this adds side effects, so bundlers like Webpack and Rollup do not tree-shake as well, unless the modules are imported from completely separate files.

### Within a Svelte project

`emoji-picker-element` is explicitly designed as a custom element, and won't work
as a direct Svelte component. However, if you're already using Svelte 3, then you
can avoid importing Svelte twice by using:

```js
import Picker from 'emoji-picker-element/svelte';
```

`svelte.js` is the same as `picker.js`, except it `import`s Svelte rather than bundling it.

## Data and offline

### Data source and JSON format

If you'd like to host the emoji JSON yourself, you can do:

    npm install emoji-picker-element-data@^1

Then host `node_modules/emoji-picker-element-data/en/emojibase/data.json` (or other JSON files) on your web server.

### Shortcodes

There is no standard for shortcodes, so unlike other emoji data, there is some disagreement as to what a "shortcode" actually is.

`emoji-picker-element-data` is based on `emojibase-data`, which offers several shortcode packs per language. For instance,
you may choose shortcodes from GitHub, Slack, Discord, or Emojibase (the default). You
can browse the available data files [on jsdelivr](https://www.jsdelivr.com/package/npm/emoji-picker-element-data) and see
more details on shortcodes [in the Emojibase docs](https://emojibase.dev/docs/shortcodes).

### Cache performance

For optimal cache performance, it's recommended that your server expose an `ETag` header. If so, `emoji-picker-element` can avoid re-downloading the entire JSON file over and over again. Instead, it will do a `HEAD` request and just check the `ETag`.

If the server hosting the JSON file is not the same as the one containing the emoji picker, then the cross-origin server will also need to expose `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: ETag` (or `Access-Control-Allow-Headers: *` ). `jsdelivr` already does this, which is partly why it is the default.

Note that [Safari does not currently support `Access-Control-Allow-Headers: *`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers#Browser_compatibility), but it does support `Access-Control-Allow-Headers: ETag`.

If `emoji-picker-element` cannot use the `ETag` for any reason, it will fall back to the less performant option, doing a full `GET` request on every page load.

### emojibase-data compatibility (deprecated)

_**Deprecated:** in v1.3.0, `emoji-picker-element` switched from [`emojibase-data`](https://github.com/milesj/emojibase) to
[`emoji-picker-element-data`](https://npmjs.com/package/emoji-picker-element-data) as its default data source. You can still use `emojibase-data`, but only v5 is supported, not v6. Support may be removed in a later release._

When using `emojibase-data`, you must use the _full_ [`emojibase-data`](https://github.com/milesj/emojibase) JSON file, not the "compact" one (i.e. `data.json`, not `compact.json`).

### Trimming the emoji data (deprecated)

_**Deprecated:** in v1.3.0, `emoji-picker-element` switched from [`emojibase-data`](https://github.com/milesj/emojibase) to
[`emoji-picker-element-data`](https://npmjs.com/package/emoji-picker-element-data) as its default data source. With the new `emoji-picker-element-data`, there is no need to trim the emoji down to size. This function is deprecated and may be removed eventually._

If you are hosting the `emojibase-data` JSON file yourself and would like it to be as small as possible, then you can use the utility `trimEmojiData` function:

```js
import trimEmojiData from 'emoji-picker-element/trimEmojiData.js';
import emojiBaseData from 'emojibase-data/en/data.json';

const trimmedData = trimEmojiData(emojiBaseData);
```

Or if your version of Node doesn't support ES modules:

```js
const trimEmojiData = require('emoji-picker-element/trimEmojiData.cjs');
```

### Offline-first

`emoji-picker-element` uses a "stale while revalidate" strategy to update emoji data. In other words, it will use any existing data it finds in IndexedDB, and lazily update via the `dataSource` in case that data has changed. This means it will work [offline-first](http://offlinefirst.org/) the second time it runs.

If you would like to manage the database yourself (e.g. to ensure that it's correctly populated before displaying the `Picker`), then create a new `Database` instance and wait for its `ready()` promise to resolve:

```js
const database = new Database();
try {
  await database.ready();
} catch (err) {
  // Deal with any errors (e.g. offline)
}
```

If `emoji-picker-element` fails to fetch the JSON data the first time it loads, then it will display an error message.

### Environments without IndexedDB

`emoji-picker-element` has a hard requirement on [IndexedDB](https://developer.mozilla.org/en-US/docs/Glossary/IndexedDB), and will not work without it.

For browsers that don't support IndexedDB, such as [Firefox in private browsing mode](https://bugzilla.mozilla.org/show_bug.cgi?id=1639542), you can polyfill it using [fake-indexeddb](https://github.com/dumbmatter/fakeIndexedDB). Here is [a working example](https://bl.ocks.org/nolanlawson/651e6fbe4356ff098f505e6cc5fb8cd8) and [more details](https://github.com/nolanlawson/emoji-picker-element/issues/9).

For Node.js environments such as [Jest](https://jestjs.io/) or [JSDom](https://github.com/jsdom/jsdom), you can also use fake-indexeddb. A [working example](https://github.com/nolanlawson/emoji-picker-element/blob/d45b61b559b8cef6840b7036e3d1749a213c490e/config/jest.setup.js#L15-L18) can be found in the tests for this very project.

## Design decisions

Some of the reasoning behind why `emoji-picker-element` is built the way it is.

### IndexedDB

The [`emojibase-data`](https://github.com/milesj/emojibase) English JSON file is [854kB](https://unpkg.com/browse/emojibase-data@5.0.1/en/), and the "compact" version is still 543kB. That's a lot of data to keep in memory just for an emoji picker. And it's not as if that number is ever going down; the Unicode Consortium keeps adding more emoji every year.

Using IndexedDB has a few advantages:

1. We don't need to keep the full emoji data in memory at all times.
2. After the first load, there is no need to download, parse, and index the JSON file again, because it's already available in IndexedDB.
3. If you want, you can even [load the IndexedDB data in a web worker](https://github.com/nolanlawson/emoji-picker-element/blob/ff86a42/test/adhoc/worker.js), keeping the main thread free from non-UI data processing.

### Native emoji

To avoid downloading a large sprite sheet that renders a particular emoji set – which may look out-of-place on different platforms, or may have [IP issues](https://blog.emojipedia.org/apples-emoji-crackdown/) – `emoji-picker-element` only renders native emoji. This means it is limited to the emoji actually installed on the user's device.

To avoid rendering ugly unsupported or half-supported emoji, `emoji-picker-element` will automatically detect emoji support and only render the supported characters. (So no empty boxes or awkward double emoji.) If no color emoji are supported by the browser/OS, then an error message is displayed (e.g. older browsers, some odd Linux configurations).

### JSON loading

Browsers deal with JSON more efficiently when it's loaded via `fetch()` rather than embedded in JavaScript. It's
[faster for the browser to parse JSON than JavaScript](https://joreteg.com/blog/improving-redux-state-transfer-performance),
becuase the data is being parsed in the more tightly-constrained JSON format than the generic JavaScript format.

Plus, embedding the JSON directly would mean re-parsing the entire object on second load, which is something we want to avoid since the data is already in IndexedDB.

### Browser support

`emoji-picker-element` only supports the latest versions of Chrome, Firefox, and Safari, as well as equivalent browsers (Edge, Opera, etc.). If you need support for older browsers, you will need polyfills for the following things (non-exhaustive list):

- Custom elements
- Shadow DOM
- ES2019+

That said, older browsers may not have a color emoji font installed at all, so `emoji-picker-element` will not work in those cases.

## Contributing

See [CONTRIBUTING.md](https://github.com/nolanlawson/emoji-picker-element/blob/master/CONTRIBUTING.md).
