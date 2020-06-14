// helper functions that help compress the code better

function callStore (store, method, key, cb) {
  store[method](key).onsuccess = e => (cb && cb(e.target.result))
}

export function getIDB (store, key, cb) {
  callStore(store, 'get', key, cb)
}

export function getAllIDB (store, key, cb) {
  callStore(store, 'getAll', key, cb)
}

export function getAllKeysIDB (store, key, cb) {
  callStore(store, 'getAllKeys', key, cb)
}
