export function createState () {
  let destroyed = false
  let currentObserver

  const propsToObservers = new Map()
  const dirtyObservers = new Set()

  let queued

  let recursionDepth = 0
  const MAX_RECURSION_DEPTH = 30

  const flush = () => {
    if (destroyed) {
      return
    }
    if (process.env.NODE_ENV !== 'production' && recursionDepth === MAX_RECURSION_DEPTH) {
      throw new Error('max recursion depth, you probably didn\'t mean to do this')
    }
    try {
      const observersToRun = [...dirtyObservers]
      dirtyObservers.clear() // clear before running to force any new updates to run in another tick of the loop
      for (const observer of observersToRun) {
        observer()
      }
    } finally {
      queued = false
      if (dirtyObservers.size) { // new updates, queue another one
        recursionDepth++
        queued = true
        Promise.resolve().then(flush)
      }
    }
  }

  const state = new Proxy({}, {
    get (target, prop) {
      // console.log('reactivity: get', prop)
      if (currentObserver) {
        let observers = propsToObservers.get(prop)
        if (!observers) {
          observers = new Set()
          propsToObservers.set(prop, observers)
        }
        observers.add(currentObserver)
      }
      return target[prop]
    },
    set (target, prop, newValue) {
      // console.log('reactivity: set', prop, newValue)
      target[prop] = newValue
      const observers = propsToObservers.get(prop)
      if (observers) {
        for (const observer of observers) {
          dirtyObservers.add(observer)
        }
        if (!queued) {
          recursionDepth = 0
          queued = true
          Promise.resolve().then(flush)
        }
      }
      return true
    }
  })

  const createEffect = (callback) => {
    const runnable = () => {
      const oldObserver = currentObserver
      currentObserver = runnable
      try {
        return callback()
      } finally {
        currentObserver = oldObserver
      }
    }
    return runnable()
  }

  if (process.env.NODE_ENV !== 'production') {
    window.state = state
  }

  return {
    state,
    createEffect,
    destroyState () {
      destroyed = true
    }
  }
}
