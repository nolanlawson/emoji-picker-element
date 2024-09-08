const intersectionObserverCache = new WeakMap()

export function contentVisibilityAction (node, abortSignal, listener) {
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    // jsdom doesn't support intersection observer; just fake it
    listener([{ target: node, isIntersecting: true }])
  } else {
    // The scroll root is always `.tabpanel`
    const root = node.closest('.tabpanel')

    let observer = intersectionObserverCache.get(root)
    if (!observer) {
      // TODO: replace this with the contentvisibilityautostatechange event when all supported browsers support it.
      // For now we use IntersectionObserver because it has better cross-browser support, and it would be bad for
      // old Safari versions if they eagerly downloaded all custom emoji all at once.
      observer = new IntersectionObserver(listener, {
        root,
        // trigger if we are 1/2 scroll container height away so that the images load a bit quicker while scrolling
        rootMargin: '50% 0px 50% 0px',
        // trigger if any part of the emoji grid is intersecting
        threshold: 0
      })

      intersectionObserverCache.set(root, observer)

      // assume that the abortSignal is always the same for this root node; just add one event listener
      abortSignal.addEventListener('abort', () => {
        console.log('IntersectionObserver destroyed')
        observer.disconnect()
      })
    }

    observer.observe(node)
  }
}
