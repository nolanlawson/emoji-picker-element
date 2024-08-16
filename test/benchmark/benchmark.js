function useFakeEtag () {
  // Fake an eTag on the headers for the emoji-picker data so that we actually reuse the cache.
  // Tachometer doesn't serve an eTag by default
  const nativeGet = Headers.prototype.get
  Headers.prototype.get = function (name) {
    if (name.toLowerCase() === 'etag') {
      return 'W/fakeEtag'
    }
    return nativeGet.call(this, name)
  }
}

const params = new URLSearchParams(window.location.search)
const benchmark = params.get('benchmark') || 'first-load'

if (benchmark === 'first-load') {
  await import('./first-load.benchmark.js')
} else if (benchmark === 'second-load') {
  useFakeEtag()
  await import('./second-load.benchmark.js')
} else if (benchmark === 'database-interactions') {
  await import('./database-interactions.benchmark.js')
} else if (benchmark === 'change-tab') {
  await import('./change-tab.benchmark.js')
} else if (benchmark === 'search') {
  await import('./search.benchmark.js')
}
