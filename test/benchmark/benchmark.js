function instrumentPickerLoading() {
  // hijack the performance.measure API so we can add our own measures just for the benchmark
  const { measure } = performance

  performance.measure = function overriddenMeasure(name, start) {
    if (name === 'initialLoad' && start === 'initialLoad') {
      // test to make sure the picker loaded with no errors
      const hasErrors = document.querySelector('emoji-picker') && document.querySelector('emoji-picker')
        .shadowRoot.querySelector('.message:not(.gone)')
      if (hasErrors) {
        console.error('picker is showing an error message')
      } else {
        measure.call(performance, 'benchmark-total', 'initialLoad')
      }
    }
    return measure.apply(performance, arguments)
  }
}

function useFakeEtag() {
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

const params = new URLSearchParams(location.search)
const benchmark = params.get('benchmark') || 'first-load'

if (benchmark === 'first-load') {
  instrumentPickerLoading()
  await import('./first-load.benchmark.js')
} else if (benchmark === 'second-load') {
  instrumentPickerLoading()
  useFakeEtag()
  await import('./second-load.benchmark.js')
} else {
  await import('./database-interactions.benchmark.js')
}