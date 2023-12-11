import { getFromMap, parseTemplate, toString } from './utils.js'

const parseCache = new WeakMap()
const domInstancesCache = new WeakMap()
const unkeyedSymbol = Symbol('un-keyed')

// Not supported in Safari <=13
const hasReplaceChildren = 'replaceChildren' in Element.prototype
function replaceChildren (parentNode, newChildren) {
  /* istanbul ignore else */
  if (hasReplaceChildren) {
    parentNode.replaceChildren(...newChildren)
  } else { // polyfill Element.prototype.replaceChildren
    while (parentNode.lastChild) {
      parentNode.removeChild(parentNode.lastChild)
    }
    for (const child of newChildren) {
      parentNode.appendChild(child)
    }
  }
}

function doChildrenNeedRerender (parentNode, newChildren) {
  let oldChild = parentNode.firstChild
  let oldChildrenCount = 0
  // iterate using firstChild/nextSibling because browsers use a linked list under the hood
  while (oldChild) {
    const newChild = newChildren[oldChildrenCount]
    // check if the old child and new child are the same
    if (newChild !== oldChild) {
      return true
    }
    oldChild = oldChild.nextSibling
    oldChildrenCount++
  }
  if (process.env.NODE_ENV !== 'production' && oldChildrenCount !== parentNode.children.length) {
    throw new Error('parentNode.children.length is different from oldChildrenCount, it should not be')
  }
  // if new children length is different from old, we must re-render
  return oldChildrenCount !== newChildren.length
}

function patchChildren (newChildren, binding) {
  const { targetNode } = binding
  let { iteratorParentNode } = binding

  let needsRerender = false

  if (iteratorParentNode) { // already rendered once
    needsRerender = doChildrenNeedRerender(iteratorParentNode, newChildren)
  } else { // first render of list
    needsRerender = true
    binding.targetNode = undefined
    binding.iteratorParentNode = iteratorParentNode = targetNode.parentNode
  }
  // console.log('needsRerender?', needsRerender, 'newChildren', newChildren)
  // avoid re-rendering list if the dom nodes are exactly the same before and after
  if (needsRerender) {
    replaceChildren(iteratorParentNode, newChildren)
  }
}

function patch (expressions, bindings) {
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
      element.setAttribute(attributeName, attributeValuePre + toString(expression) + attributeValuePost)
    } else { // text node / dom node replacement
      let newNode
      if (Array.isArray(expression)) { // array of html tag templates
        patchChildren(expression, binding)
      } else if (expression instanceof Node) { // html tag template returning a DOM node
        newNode = expression
        if (newNode !== targetNode) {
          targetNode.replaceWith(newNode)
        }
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

function parse (tokens) {
  let htmlString = ''

  let withinTag = false
  let withinAttribute = false
  let elementIndexCounter = -1 // depth-first traversal order

  const boundExpressions = new Map()
  const elementIndexes = []

  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i]
    htmlString += token

    if (i === len - 1) {
      break // no need to process characters
    }

    for (let j = 0; j < token.length; j++) {
      const char = token.charAt(j)
      switch (char) {
        case '<': {
          const nextChar = token.charAt(j + 1)
          if (nextChar !== '!' && nextChar !== '/') { // not a closing tag or comment
            withinTag = true
            elementIndexes.push(++elementIndexCounter)
          } else if (nextChar === '/') {
            // leaving an element
            elementIndexes.pop()
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

    // add a placeholder comment that we can find later
    htmlString += (!withinTag && !withinAttribute) ? `<!--${bindings.length - 1}-->` : ''
  }

  const template = parseTemplate(htmlString)

  return {
    template,
    boundExpressions
  }
}

function cloneBoundExpressions (boundExpressions) {
  const map = new Map()
  for (const [id, bindings] of boundExpressions.entries()) {
    map.set(id, bindings.map(binding => ({ ...binding })))
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
            // find all placeholder comments once
            foundComments = new Map()
            for (const childNode of element.childNodes) {
              // Note that minify-html-literals has already removed all non-framework comments
              // But just to be safe, only look for comments that contain pure integers
              if (childNode.nodeType === Node.COMMENT_NODE && /^\d+$/.test(childNode.textContent)) {
                foundComments.set(parseInt(childNode.textContent, 10), childNode)
              }
            }
          }
          binding.targetNode = foundComments.get(i)
          if (process.env.NODE_ENV !== 'production' && !binding.targetNode) {
            throw new Error('should not be undefined')
          }
        }
      }
    }
  } while ((element = treeWalker.nextNode()))
}

function cloneDomAndBind (template, boundExpressions) {
  const dom = template.cloneNode(true).content.firstElementChild
  const clonedBoundExpressions = cloneBoundExpressions(boundExpressions)
  traverseAndSetupBindings(dom, clonedBoundExpressions)
  const bindings = [...clonedBoundExpressions.values()].flat()
  return { dom, bindings }
}

function parseHtml (tokens) {
  // All templates and bound expressions are unique per tokens array
  const { template, boundExpressions } = getFromMap(parseCache, tokens, () => parse(tokens))

  // When we parseHtml, we always return a fresh DOM instance ready to be updated
  const { dom, bindings } = cloneDomAndBind(template, boundExpressions)

  return function update (expressions) {
    patch(expressions, bindings)
    return dom
  }
}

export function createFramework (state) {
  const domInstances = getFromMap(domInstancesCache, state, () => new Map())
  let domInstanceCacheKey = unkeyedSymbol

  function html (tokens, ...expressions) {
    // Each unique lexical usage of map() is considered unique due to the html`` tagged template call it makes,
    // which has lexically unique tokens. The unkeyed symbol is just used for html`` usage outside of a map().
    const domInstancesForTokens = getFromMap(domInstances, tokens, () => new Map())
    const domInstance = getFromMap(domInstancesForTokens, domInstanceCacheKey, () => parseHtml(tokens))

    return domInstance(expressions) // update with expressions
  }

  function map (array, callback, keyFunction) {
    return array.map((item, index) => {
      const originalCacheKey = domInstanceCacheKey
      domInstanceCacheKey = keyFunction(item)
      try {
        return callback(item, index)
      } finally {
        domInstanceCacheKey = originalCacheKey
      }
    })
  }

  return { map, html }
}
