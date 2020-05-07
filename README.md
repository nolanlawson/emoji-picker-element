lite-emoji-picker
====

A small, performant, accessible emoji picker and lookup library, distributed as a web component.

Built on top of IndexedDB so it consumes far less memory then other emoji pickers. Suitable for mobile web apps or resource-constrained environments.

Why
---

The emojibase-data "compact" JSON file is 532KB. That's a lot of data to keep in memory just to work with emoji. (And it's not like the Unicode Consortium is going to stop adding emoji anytime soon.)

Install
----

    npm install lite-emoji-picker

```js
import { Picker } from 'lite-emoji-picker'
```
