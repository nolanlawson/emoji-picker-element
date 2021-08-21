// hijack the performance.mark/measure API so we can add our own marks/measures just for the benchmark
const { mark, measure } = performance

performance.mark = function (name) {
  if (name === 'initialLoad') {
    mark.call(performance, 'benchmark-start')
  }
}

performance.measure = function (name, start) {
  if (name === 'initialLoad' && start === 'initialLoad') {
    // test to make sure the picker loaded with no errors
    const hasErrors = document.querySelector('emoji-picker') && document.querySelector('emoji-picker')
      .shadowRoot.querySelector('.message:not(.gone)')
    if (hasErrors) {
      console.error('picker is showing an error message')
    } else {
      measure.call(performance, 'benchmark-total', 'benchmark-start')
    }
  }
}

// Fake an eTag on the headers for the emoji-picker data so that we actually reuse the cache.
// Tachometer doesn't serve an eTag by default
const nativeGet = Headers.prototype.get
Headers.prototype.get = function (name) {
  if (name.toLowerCase() === 'etag') {
    return 'W/fakeEtag'
  }
  return nativeGet.call(this, name)
}
