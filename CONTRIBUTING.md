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

### Why is it one big Svelte component?

When you build Svelte components with `customElement: true`, it makes _each individual component_ into a web component. This can be bad for perf reasons (lots of repetition, [constructible stylesheets](https://wicg.github.io/construct-stylesheets/) aren't a thing yet, event and prop overhead) as well as correctness reasons (e.g. I want an `<li>` inside of a `<ul>`, not a `<custom-element>` with a shadow DOM and the `<li>` inside of it).

So for now: it's one big component.

### Why use svelte-preprocess?

Since it's one big component, it's more readable if we split up the HTML/CSS/JS. Plus, we can lint the JS more easily that way. Plus, I like SCSS.

### Why are TypeScript files separate?

I don't really like writing TypeScript, but I appreciate the documentation and autocompletion it provides for consumers. I could just author the `.d.ts` files, but 1) I don't really know how to do that, and 2) `typedoc` seems to require TypeScript as input, not `.d.ts`.

So, I just have a `types/` directory with some fake TypeScript files to generate the types and docs. Happy to revisit later if there's a better solution.

### Why are the built JS files at the root of the project?

When publishing to npm, we want people to be able to do e.g. `import Picker from 'emoji-picker-element/picker'`. The only way to get that is to put `picker.js` at the top level.

I could also build a `pkg/` directory and copy the `package.json` into it (this is kinda what Pika Pack does), but for now I'm just keeping things simple.

### Why build two separate bundles?

`picker.js` and `database.js` are designed to be independentally `import`-able. The only way to do this correctly with the right behavior from bundlers like Rollup and Webpack is to create two separate files. Otherwise the bundler would not be able to tree-shake `picker` from `database`.
