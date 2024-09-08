/* istanbul ignore next */
const SUPPORTS_CONTENT_VISIBILITY = import.meta.env.MODE !== 'test' && CSS.supports('content-visibility', 'auto')

export function contentVisibilityAction (node, signal, listener) {
  /* istanbul ignore if */
  if (SUPPORTS_CONTENT_VISIBILITY) {
    node.addEventListener('contentvisibilityautostatechange', listener, { signal })
  } else {
    // If content visibility is unsupported, then just treat every element as always visible.
    // This browser will just not get the optimization
    listener({ skipped: false })
  }
}
