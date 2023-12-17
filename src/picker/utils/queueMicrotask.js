/* istanbul ignore next */
const qM = typeof queueMicrotask === 'function' ? queueMicrotask : callback => Promise.resolve().then(callback)
export { qM as queueMicrotask }
