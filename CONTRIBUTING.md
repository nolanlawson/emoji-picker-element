# Contributing

## Basic dev workflow


Install

    yarn

Run a local dev server on `localhost:3000`:

    yarn dev
    
## Testing

Lint:

    yarn lint

Fix most lint issues:

    yarn lint:fix

Run the tests:

    yarn test

Check code coverage:

    yarn cover

## Other

Benchmark runtime performance:

    yarn benchmark:runtime

Benchmark memory usage:

    yarn benchmark:memory

Benchmark bundle size:

    yarn benchmark:bundlesize

Benchmark storage size:

    yarn benchmark:storage

Run memory leak test:

    yarn test:leak

Build the GitHub Pages docs site:

    yarn docs

## FAQs

Some explanations of why the code is structured the way it is, in case it's confusing.

### Why a custom framework?

It was [a good learning exercise](https://nolanlawson.com/2023/12/02/lets-learn-how-modern-javascript-frameworks-work-by-building-one/), and it reduced the bundle size quite a bit to switch from Svelte to a custom framework. Plus, `emoji-picker-element` no longer needs to keep
up with breaking changes in Svelte or the tools in the Svelte ecosystem (e.g. Rollup and Jest plugins).

### What are some of the quirks of the custom framework?

The framework mostly gets the job done, but I took a few shortcuts since we didn't need all the possible bells and whistles. Here is a brief description.

First, all of the DOM nodes and update functions for those nodes are kept in-memory via a WeakMap pointing at the `state`. There's one `state` per instance of the `Picker.js` Svelte-esque component. So when the instance is GC'ed, everything related to the DOM and update functions should be GC'ed.

Second, I took a shortcut, which is that all DOM nodes and update functions are keyed off of 1) the unique tokens for the tag template literal plus 2) a unique `key` from the `map` function (if it exists). These are only GC'ed when the whole `state` is GC'ed. So in the worst case, every DOM node for every emoji in the picker is kept in memory (e.g. if you click on every tab button), but this seemed like a reasonable tradeoff for simplicity, plus the perf improvement of avoiding re-rendering the same node when it's unchanged (this is especially important if the reactivity system is kind of chatty, and is constantly setting the same arrays over and over – the framework just notices that all the `children` are the same objects and doesn't re-render). This also works because the `map`ed DOM nodes are not highly dynamic.

Third, all refs and event listeners are only bound once – this just happens to work since most of the event listeners are hoisted (delegated) anyway.

Fourth, `map`ped iterations without a single top-level element are unsupported – this makes updating iterations much easier, since I can just use `Element.replaceChildren()` instead of having to keep bookmark comment nodes or something.

Fifth, the reactivity system is really bare-bones and doesn't check for cycles or avoid wasteful re-renderings or anything. So there's a lot of guardrails to avoid setting the same object over and over to avoid infinite cycles or to avoid excessive re-renders.

Sixth, I tried to get fine-grained reactivity working but gave up, so basically the whole top-level `PickerTemplate.js` function is executed over and over again anytime anything changes. So there are guardrails in place to make sure this isn't expensive (e.g. the caching mechanisms described above).

There's also a long tail of things that aren't supported in the HTML parser, like funky characters like `<` and `=` inside of text nodes, which could confuse the parser (so I just don't support them).

Also, it's assumed that we're using some kind of minifier for the HTML tagged template literals – it would be annoying to have to author `PickerTemplate.js` without any whitespace. So the parser doesn't support comments since those are assumed to be stripped out anyway.

That's about it, there are probably bugs in the framework if you tried to use it for something other than `emoji-picker-element`, but that's fine – it only needs to support one component anyway.

### Why are the built JS files at the root of the project?

When publishing to npm, we want people to be able to do e.g. `import Picker from 'emoji-picker-element/picker'`. The only way to get that is to put `picker.js` at the top level.

I could also build a `pkg/` directory and copy the `package.json` into it (this is kinda what Pika Pack does), but for now I'm just keeping things simple.

### Why build two separate bundles?

`picker.js` and `database.js` are designed to be independently `import`-able. The only way to do this correctly with the right behavior from bundlers like Rollup and Webpack is to create two separate files. Otherwise the bundler would not be able to tree-shake `picker` from `database`.
