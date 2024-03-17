export const abortOpportunityEventTarget = /* @__PURE__ */ new EventTarget()

export async function abortOpportunity () {
  // we need some way to test that someone called signal.aborted in our tests
  abortOpportunityEventTarget.dispatchEvent(new CustomEvent('called'))
  // Allow enough microtasks for our test code to handle the event and respond to it asynchronously
  await Promise.resolve()
  await Promise.resolve()
}
