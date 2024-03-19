export const abortOpportunityEventTarget = /* @__PURE__ */ new EventTarget()

export async function abortOpportunity () {
  // we need some way to test that someone called signal.aborted in our tests
  abortOpportunityEventTarget.dispatchEvent(new CustomEvent('called'))
  // Allow enough microtasks for our test code to handle the event and respond to it asynchronously
  await Promise.resolve()
  await Promise.resolve()
}

export function throwIfAborted (signal) {
  if (signal.aborted) {
    // This is what is thrown by fetch() if the signal is aborted
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException#aborterror
    throw new DOMException('The operation was aborted', 'AbortError')
  }
}
