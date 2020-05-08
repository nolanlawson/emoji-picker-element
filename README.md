lite-emoji-picker
====

A small, performant, accessible emoji picker and lookup library, distributed as a web component.

Built on top of IndexedDB so it consumes far less memory then other emoji pickers. Suitable for mobile web apps or other resource-constrained environments.

Why
---

The [`emojibase-data`](https://github.com/milesj/emojibase) "compact" English JSON file is [543KB](https://unpkg.com/browse/emojibase-data@5.0.1/en/). That's a lot of data to keep in memory just to work with emoji. (And it's not as if the Unicode Consortium is going to stop adding emoji anytime soon.)

Using IndexedDB has a few advantages:

1. We don't need to keep half a megabyte of emoji data in memory at all times.
2. The second time your visitors visit your website, we don't even need to download, parse, and index the emoji data, because it's already available on their hard drive.

Install
----

    npm install lite-emoji-picker

```js
import { Picker } from 'lite-emoji-picker'
```
