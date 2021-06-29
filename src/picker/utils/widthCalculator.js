// Svelte action to calculate the width of an element and auto-update
// using ResizeObserver. If ResizeObserver is unsupported, we just use rAF once
// and don't bother to update.

import { requestAnimationFrame } from './requestAnimationFrame'

export let resizeObserverSupported = typeof ResizeObserver === 'function'

// only used in jest tests
export const resetResizeObserverSupported = () => {
  resizeObserverSupported = typeof ResizeObserver === 'function'
}

export function calculateWidth (node, onUpdate) {
  let resizeObserver
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver(entries => (
      onUpdate(entries[0].contentRect.width)
    ))
    resizeObserver.observe(node)
  } else { // just set the width once, don't bother trying to track it
    requestAnimationFrame(() => (
      onUpdate(node.getBoundingClientRect().width)
    ))
  }

  // cleanup function (called on disconnect)
  return () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }
}
