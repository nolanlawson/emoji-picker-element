const isHtmlTagTemplateExpression = Symbol('html-tag-template-expression')

// via https://github.com/component/escape-html/blob/b42947eefa79efff01b3fe988c4c7e7b051ec8d8/index.js
function escapeHtml (string) {
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

function toString (value) {
  if (typeof value === 'undefined') {
    return 'undefined'
  } else if (value === null) {
    return 'null'
  }
  return value.toString()
}

function parseTemplate (htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString

  if (process.env.NODE_ENV !== 'production') {
    if (template.content.children.length !== 1) {
      throw new Error('only 1 child allowed for now')
    }
  }
  return template
}

function createUpdater () {
  return (dom, boundExpressions) => {
    traverseAndSetupBindings(dom, boundExpressions)

    return (expressions) => {
      for (const bindings of boundExpressions.values()) {
        for (const binding of bindings) {
          const {
            expressionIndex,
            withinAttribute,
            targetNode,
            element,
            attributeName,
            attributeValuePre,
            attributeValuePost,
            lastExpression
          } = binding
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
            if (expression && Array.isArray(expression)) { // array of html tag templates
              const { parentNode } = targetNode
              if (binding.iteratorEndNode) { // already rendered once - clean up
                console.log('re-render')
                let currentSibling = targetNode.nextSibling
                while (!(currentSibling.nodeType === Node.COMMENT_NODE && currentSibling.textContent === 'end')) {
                  const oldSibling = currentSibling
                  currentSibling = currentSibling.nextSibling
                  oldSibling.remove()
                }
              } else { // first render of list
                const iteratorEndNode = document.createComment('end')
                parentNode.insertBefore(iteratorEndNode, targetNode.nextSibling)
                binding.iteratorEndNode = iteratorEndNode
              }
              const { iteratorEndNode } = binding
              for (const subExpression of expression) {
                if (subExpression && subExpression[isHtmlTagTemplateExpression]) { // html tag template itself
                  parentNode.insertBefore(subExpression.dom, iteratorEndNode)
                } else { // primitive - string, number, etc
                  const textNode = document.createTextNode(toString(subExpression))
                  parentNode.insertBefore(textNode, iteratorEndNode)
                }
              }
            } else if (expression && expression[isHtmlTagTemplateExpression]) { // html tag template itself
              newNode = expression.dom
              targetNode.replaceWith(newNode)
            } else { // primitive - string, number, etc
              if (targetNode.nodeType === Node.TEXT_NODE) { // already transformed into a text node
                targetNode.nodeValue = toString(expression)
              } else { // replace comment or whatever was there before with a text node
                newNode = document.createTextNode(toString(expression))
                targetNode.replaceWith(newNode)
              }
            }
            if (newNode) {
              binding.targetNode = newNode
            }
          }
        }
      }
    }
  }
}

function parse (tokens) {
  let htmlString = ''

  let withinTag = false
  let withinAttribute = false
  let elementIndexCounter = -1 // depth-first traversal order

  const boundExpressions = new Map()

  const elementIndexes = []

  const push = () => {
    elementIndexes.push(++elementIndexCounter)
  }

  const pop = () => {
    elementIndexes.pop()
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    htmlString += token

    if (i === tokens.length - 1) {
      break // no need to process characters
    }

    for (let j = 0; j < token.length; j++) {
      const char = token.charAt(j)
      switch (char) {
        case '<': {
          const nextChar = token.charAt(j + 1)
          if (nextChar !== '!' && nextChar !== '/') { // not a closing tag or comment
            withinTag = true
            push()
          } else if (nextChar === '/') {
            // leaving an element
            pop()
          }
          break
        }
        case '>': {
          withinTag = false
          withinAttribute = false
          break
        }
        case '=': {
          if (withinTag) {
            withinAttribute = true
          }
          break
        }
      }
    }

    const elementIndex = elementIndexes[elementIndexes.length - 1]
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

  const template = parseTemplate(htmlString)

  return {
    template,
    boundExpressions,
  }
}

const parseCache = new WeakMap()

function parseWithCache (tokens) {
  let cached = parseCache.get(tokens)
  if (!cached) {
    cached = parse(tokens)
    parseCache.set(tokens, cached)
  }
  return cached
}

function cloneBoundExpressions(boundExpressions) {
  const map = new Map()
  for (const [id, bindings] of boundExpressions.entries()) {
    map.set(id, bindings.map(_ => structuredClone(_)))
  }
  return map
}

function traverseAndSetupBindings (dom, boundExpressions) {
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

function html (tokens, ...expressions) {
  const {
    template,
    boundExpressions
  } = parseWithCache(tokens)

  const updater = createUpdater()
  const clonedDom = template.cloneNode(true).content.firstElementChild
  const clonedBoundExpressions = cloneBoundExpressions(boundExpressions)
  const update = updater(clonedDom, clonedBoundExpressions)

  return {
    dom: clonedDom,
    expressions,
    update,
    [isHtmlTagTemplateExpression]: true
  }
}

function map (array, callback) {
  return array.map(callback)
}

export {
  html,
  map
}
