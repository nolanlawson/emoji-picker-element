/* istanbul ignore next */
const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout

export { rIC as requestIdleCallback }
