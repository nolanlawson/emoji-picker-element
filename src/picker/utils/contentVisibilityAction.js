/* istanbul ignore next */
const SUPPORTS_CONTENT_VISIBILITY = import.meta.env.MODE !== 'test' && CSS.supports('content-visibility', 'auto')

export function contentVisibilityAction (node, listener) {
  /* istanbul ignore if */
  if (SUPPORTS_CONTENT_VISIBILITY) {
    // Note we don't need an abortSignal here because if the node is removed then the event listener is also GC'ed
    node.addEventListener('contentvisibilityautostatechange', listener)
  } else {
    // If content visibility is unsupported, then just treat every element as always visible.
    // This browser will just not get the optimization
    listener({ skipped: false })
  }
}
