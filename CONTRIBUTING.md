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

### Why are the built JS files at the root of the project?

When publishing to npm, we want people to be able to do e.g. `import Picker from 'emoji-picker-element/picker'`. The only way to get that is to put `picker.js` at the top level.

I could also build a `pkg/` directory and copy the `package.json` into it (this is kinda what Pika Pack does), but for now I'm just keeping things simple.

### Why build two separate bundles?

`picker.js` and `database.js` are designed to be independentally `import`-able. The only way to do this correctly with the right behavior from bundlers like Rollup and Webpack is to create two separate files. Otherwise the bundler would not be able to tree-shake `picker` from `database`.
