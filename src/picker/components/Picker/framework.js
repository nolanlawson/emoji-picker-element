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

function patchChildren (newChildren, instanceBinding) {
  const { targetNode } = instanceBinding
  let { targetParentNode } = instanceBinding

  let needsRerender = false

  if (targetParentNode) { // already rendered once
    needsRerender = doChildrenNeedRerender(targetParentNode, newChildren)
  } else { // first render of list
    needsRerender = true
    instanceBinding.targetNode = undefined // placeholder comment not needed anymore, free memory
    instanceBinding.targetParentNode = targetParentNode = targetNode.parentNode
  }
  // console.log('needsRerender?', needsRerender, 'newChildren', newChildren)
  // avoid re-rendering list if the dom nodes are exactly the same before and after
  if (needsRerender) {
    replaceChildren(targetParentNode, newChildren)
  }
}

function patch (expressions, instanceBindings) {
  for (const instanceBinding of instanceBindings) {
    const {
      targetNode,
      currentExpression,
      binding: {
        expressionIndex,
        attributeName,
        attributeValuePre,
        attributeValuePost
      }
    } = instanceBinding

    const expression = expressions[expressionIndex]

    if (currentExpression === expression) {
      // no need to update, same as before
      continue
    }

    instanceBinding.currentExpression = expression

    if (attributeName) { // attribute replacement
      targetNode.setAttribute(attributeName, attributeValuePre + toString(expression) + attributeValuePost)
    } else { // text node / child element / children replacement
      let newNode
      if (Array.isArray(expression)) { // array of html tag templates
        patchChildren(expression, instanceBinding)
      } else if (expression instanceof Element) { // html tag template returning a DOM element
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
        instanceBinding.targetNode = newNode
      }
    }
  }
}

function parse (tokens) {
  let htmlString = ''

  let withinTag = false
  let withinAttribute = false
  let elementIndexCounter = -1 // depth-first traversal order

  const elementsToBindings = new Map()
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
    let bindings = elementsToBindings.get(elementIndex)
    if (!bindings) {
      bindings = []
      elementsToBindings.set(elementIndex, bindings)
    }

    let attributeName
    let attributeValuePre
    let attributeValuePost
    if (withinAttribute) {
      attributeName = /(\S+)="?(?:[^"]+)?$/.exec(token)[1]
      attributeValuePre = /="?([^"=]*)$/.exec(token)[1]
      attributeValuePost = /^([^">]*)/.exec(tokens[i + 1])[1]
    }

    const binding = {
      attributeName,
      attributeValuePre,
      attributeValuePost,
      expressionIndex: i
    }

    if (process.env.NODE_ENV !== 'production') {
      // remind myself that this object is supposed to be immutable
      Object.freeze(binding)
    }

    bindings.push(binding)

    // add a placeholder comment that we can find later
    htmlString += (!withinTag && !withinAttribute) ? `<!--${bindings.length - 1}-->` : ''
  }

  const template = parseTemplate(htmlString)

  return {
    template,
    elementsToBindings
  }
}

function findPlaceholderComments (element) {
  const result = new Map()
  for (const childNode of element.childNodes) {
    // Note that minify-html-literals has already removed all non-framework comments
    // But just to be safe, only look for comments that contain pure integers
    if (childNode.nodeType === Node.COMMENT_NODE && /^\d+$/.test(childNode.textContent)) {
      result.set(parseInt(childNode.textContent, 10), childNode)
    }
  }
  return result
}

function traverseAndSetupBindings (dom, elementsToBindings) {
  const instanceBindings = []
  // traverse dom
  const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ELEMENT)

  let element = dom
  let elementIndex = -1
  do {
    const bindings = elementsToBindings.get(++elementIndex)
    if (bindings) {
      let placeholderComments
      for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i]

        let targetNode
        if (binding.attributeName) { // attribute binding
          targetNode = element
        } else { // not an attribute binding, so has a placeholder comment
          if (!placeholderComments) { // find all placeholder comments once
            placeholderComments = findPlaceholderComments(element)
          }
          targetNode = placeholderComments.get(i)
        }

        if (process.env.NODE_ENV !== 'production' && !targetNode) {
          throw new Error('targetNode should not be undefined')
        }

        const instanceBinding = {
          binding,
          targetNode,
          targetParentNode: undefined,
          currentExpression: undefined
        }

        if (process.env.NODE_ENV !== 'production') {
          // remind myself that this object is supposed to be monomorphic (for better JS engine perf)
          Object.seal(instanceBinding)
        }

        instanceBindings.push(instanceBinding)
      }
    }
  } while ((element = treeWalker.nextNode()))

  return instanceBindings
}

function cloneDomAndBind (template, elementsToBindings) {
  const dom = template.cloneNode(true).content.firstElementChild
  const instanceBindings = traverseAndSetupBindings(dom, elementsToBindings)
  return { dom, instanceBindings }
}

function parseHtml (tokens) {
  // All templates and bound expressions are unique per tokens array
  const { template, elementsToBindings } = getFromMap(parseCache, tokens, () => parse(tokens))

  // When we parseHtml, we always return a fresh DOM instance ready to be updated
  const { dom, instanceBindings } = cloneDomAndBind(template, elementsToBindings)

  return function update (expressions) {
    patch(expressions, instanceBindings)
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
