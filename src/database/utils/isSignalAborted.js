export let signalAbortedEventTarget

/* istanbul ignore else */
if (import.meta.env.MODE === 'test') {
  signalAbortedEventTarget = new EventTarget()
}

export function isSignalAborted (signal) {
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    // we need some way to test that someone called signal.aborted in our tests
    signalAbortedEventTarget.dispatchEvent(new CustomEvent('called'))
  }

  return signal.aborted
}
