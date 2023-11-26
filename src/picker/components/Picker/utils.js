export function getFromMap (cache, key, func) {
  let cached = cache.get(key)
  if (!cached) {
    cached = func()
    cache.set(key, cached)
  }
  return cached
}

// via https://github.com/component/escape-html/blob/b42947eefa79efff01b3fe988c4c7e7b051ec8d8/index.js
export function escapeHtml (string) {
  const str = '' + string
  const match = /["'&<>]/.exec(str)

  if (!match) {
    return str
  }

  let escape
  let html = ''
  let index = 0
  let lastIndex = 0

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;'
        break
      case 38: // &
        escape = '&amp;'
        break
      case 39: // '
        escape = '&#39;'
        break
      case 60: // <
        escape = '&lt;'
        break
      case 62: // >
        escape = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escape
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}

export function toString (value) {
  if (typeof value === 'undefined') {
    return 'undefined'
  } else if (value === null) {
    return 'null'
  }
  return value.toString()
}

export function parseTemplate (htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString

  if (process.env.NODE_ENV !== 'production') {
    if (template.content.children.length !== 1) {
      throw new Error('only 1 child allowed for now')
    }
  }
  return template
}
