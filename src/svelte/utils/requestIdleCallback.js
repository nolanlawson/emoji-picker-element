const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : requestAnimationFrame

export { rIC as requestIdleCallback }