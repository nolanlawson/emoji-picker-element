// "Svelte action"-like utility to detect layout changes via ResizeObserver.
// If ResizeObserver is unsupported, we just use rAF once and don't bother to update.

import { requestAnimationFrame } from './requestAnimationFrame'

export let resizeObserverSupported = typeof ResizeObserver === 'function'

// only used in jest/vitest tests
export const resetResizeObserverSupported = () => {
  resizeObserverSupported = typeof ResizeObserver === 'function'
}

export function resizeObserverAction (node, abortSignal, onUpdate) {
  let resizeObserver
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver(onUpdate)
    resizeObserver.observe(node)
  } else { // just run once, don't bother trying to track it
    requestAnimationFrame(onUpdate)
  }

  // cleanup function (called on destroy)
  abortSignal.addEventListener('abort', () => {
    if (resizeObserver) {
      console.log('ResizeObserver destroyed')
      resizeObserver.disconnect()
    }
  })
}
