// Putting all these globals in one place and referencing them with @rollup/plugin-inject
// reduces the bundle size slightly (although increasing the compressed size a bit)

const rAF = requestAnimationFrame
export { rAF as requestAnimationFrame }

const Prom = Promise
export { Prom as Promise }

const IDBKR = IDBKeyRange
export { IDBKR as IDBKeyRange }

const doc = document
export { doc as document }

const M = Map
export { M as Map }
