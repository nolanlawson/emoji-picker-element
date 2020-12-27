// Svelte action to calculate the width of an element and auto-update
// using ResizeObserver. If ResizeObserver is unsupported, we just use rAF once
// and don't bother to update.

import { requestAnimationFrame } from './requestAnimationFrame'

export const resizeObserverSupported = () => typeof ResizeObserver === 'function'

export function calculateWidth (node, onUpdate) {
  let resizeObserver
  if (resizeObserverSupported()) {
    resizeObserver = new ResizeObserver(entries => (
      onUpdate(entries[0].contentRect.width)
    ))
    resizeObserver.observe(node)
  } else { // just set the width once, don't bother trying to track it
    requestAnimationFrame(() => (
      onUpdate(node.getBoundingClientRect().width)
    ))
  }

  return {
    destroy () {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }
}
