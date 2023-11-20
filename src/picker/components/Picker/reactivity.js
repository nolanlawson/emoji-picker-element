export function createState () {
  let currentObserver

  const propsToObservers = new Map()
  const dirtyObservers = new Set()

  let queued

  const flush = () => {
    console.log('flush')
    try {
      for (const observer of dirtyObservers) {
        observer()
      }
    } finally {
      dirtyObservers.clear()
      queued = false
    }
  }

  const state = new Proxy({}, {
    get (target, prop) {
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
      target[prop] = newValue
      const observers = propsToObservers.get(prop)
      if (observers) {
        for (const observer of observers) {
          dirtyObservers.add(observer)
        }
        if (!queued) {
          queued = true
          Promise.resolve().then(flush)
        }
      }
      return true
    }
  })

  const createEffect = (callback, noInit) => {
    const runnable = () => {
      currentObserver = callback
      try {
        return callback()
      } finally {
        currentObserver = undefined
      }
    }
    if (!noInit) {
      runnable()
    }
    return runnable
  }

  return {
    state,
    createEffect
  }
}
