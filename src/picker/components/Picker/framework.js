// via https://github.com/component/escape-html/blob/b42947eefa79efff01b3fe988c4c7e7b051ec8d8/index.js
function escapeHtml(string) {
  let str = '' + string
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

function toString(value) {
  if (typeof value === 'undefined') {
    return 'undefined'
  } else if (value === null) {
    return 'null'
  }
  return value.toString()
}

function parseDom(htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString
  return template.content.firstChild
}

function parse(tokens) {
  let htmlString = ''

  let withinTag = false
  let withinAttribute = false
  let elementIndex = -1 // depth-first traversal order

  const boundExpressions = new Map()

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    htmlString += token

    if (i === tokens.length - 1) {
      break // no need to process characters
    }

    for (const char of token) {
      switch (char) {
        case '<':
          withinTag = true
          elementIndex++
          break
        case '>':
          withinTag = false
          withinAttribute = false
          break
        case '=':
          if (withinTag) {
            withinAttribute = true
          }
          break
      }
    }

    let bindings = boundExpressions.get(elementIndex)
    if (!bindings) {
      bindings = []
      boundExpressions.set(elementIndex, bindings)
    }

    let attributeName
    let attributeValuePre
    let attributeValuePost
    if (withinAttribute) {
      attributeName = /(\S+)="?(?:[^"]+)?$/.exec(token)[1]
      attributeValuePre = /="?([^"=]*)$/.exec(token)[1]
      attributeValuePost = /^([^">]*)/.exec(tokens[i + 1])[1]
    }

    bindings.push({
      withinTag,
      withinAttribute,
      attributeName,
      attributeValuePre,
      attributeValuePost,
      expressionIndex: i
    })


    htmlString += (!withinTag && !withinAttribute) ? `<!--placeholder-${bindings.length - 1}-->` : ''
  }

  const dom = parseDom(htmlString)

  traverseAndSetupBindings(tokens, dom, boundExpressions)

  const update = (expressions) => {
    for (const bindings of boundExpressions.values()) {
      for (const binding of bindings) {
        const { expressionIndex, withinAttribute, targetNode, element, attributeName, attributeValuePre, attributeValuePost, lastExpression } = binding
        const expression = expressions[expressionIndex]

        if (lastExpression === expression) {
          // no need to update, same as before
          continue
        }

        binding.lastExpression = expression

        if (withinAttribute) {
          element.setAttribute(attributeName, attributeValuePre + escapeHtml(toString(expression)) + attributeValuePost)
        } else { // text node / dom node replacement
          let newNode
          if (expression && expression[isHtmlTagTemplateExpression]) { // html tag template itself
            newNode = expression.dom
          } else { // primitive - string, number, etc
            if (targetNode.nodeType === Node.TEXT_NODE) { // already transformed into a text node
              targetNode.nodeValue = toString(expression)
            } else { // replace comment or whatever was there before with a text node
              newNode = document.createTextNode(toString(expression))
              targetNode.replaceWith(newNode)
            }
          }
          if (newNode) {
            targetNode.replaceWith(newNode)
            binding.targetNode = newNode
          }
        }
      }
    }
  }

  return {
    dom,
    boundExpressions,
    update
  }
}

const isHtmlTagTemplateExpression = Symbol('html-tag-template-expression')

const parseCache = new WeakMap()

function parseWithCache(tokens) {
  let cached = parseCache.get(tokens)
  if (!cached) {
    cached = parse(tokens)
    parseCache.set(tokens, cached)
  }
  return cached
}

function traverseAndSetupBindings (tokens, dom, boundExpressions) {
  // traverse dom
  const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ELEMENT)

  let element = dom
  let elementIndex = -1
  do {
    const bindings = boundExpressions.get(++elementIndex)
    if (bindings) {
      let foundComments
      for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i]

        binding.element = element

        if (!binding.withinAttribute) {
          if (!foundComments) {
            // find all comments once
            foundComments = new Map()
            for (const childNode of element.childNodes) {
              let match
              if (childNode.nodeType === Node.COMMENT_NODE && (match = /^placeholder-(\d+)/.exec(childNode.textContent))) {
                foundComments.set(parseInt(match[1], 10), childNode)
              }
            }
          }
          binding.targetNode = foundComments.get(i)
        }
      }
    }
  } while ((element = treeWalker.nextNode()))
}

export function html(tokens, ...expressions) {
  const {
    dom,
    boundExpressions,
    update
  } = parseWithCache(tokens)

  update(expressions)

  return {
    dom,
    boundExpressions,
    [isHtmlTagTemplateExpression]: true
  }
}

export function map(array, callback) {
  return array.map(callback)
}