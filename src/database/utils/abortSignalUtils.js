export const abortOpportunityEventTarget = /* @__PURE__ */ new EventTarget()

export async function abortOpportunity () {
  // We need some way to test that someone called signal.aborted in our tests
  // Note that we only need to do this either 1) right before a fetch, since any read on the request/response
  // fo the fetch will throw an AbortError if the signal is aborted, and 2) after any non-fetch async call
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
