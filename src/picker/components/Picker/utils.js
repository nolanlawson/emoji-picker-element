export function getFromMap (cache, key, func) {
  let cached = cache.get(key)
  if (!cached) {
    cached = func()
    cache.set(key, cached)
  }
  return cached
}

export function toString (value) {
  return '' + value
}

export function parseTemplate (htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString

  /* istanbul ignore next */
  if (import.meta.env.MODE !== 'production') {
    if (template.content.children.length !== 1) {
      throw new Error('only 1 child allowed for now')
    }
  }
  return template
}
