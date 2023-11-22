// TODO: drop Svelte v3 support
// ensure_array_like was added in Svelte v4 - we shim it to avoid breaking Svelte v3 users
// this code is copied from svelte v4
/* eslint-disable camelcase */
export function ensure_array_like_shim (array_like_or_iterator) {
  return array_like_or_iterator && array_like_or_iterator.length !== undefined
    ? array_like_or_iterator
    : Array.from(array_like_or_iterator)
}
