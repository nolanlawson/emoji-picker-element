import { getFromMap, parseTemplate, toString } from './utils.js'

const parseCache = new WeakMap()
const domInstancesCache = new WeakMap()
// This needs to be a symbol because it needs to be different from any possible output of a key function
const unkeyedSymbol = Symbol('un-keyed')

// for debugging
/* istanbul ignore else */
if (import.meta.env.MODE !== 'production') {
  window.parseCache = parseCache
  window.domInstancesCache = domInstancesCache
}

// Not supported in Safari <=13
const hasReplaceChildren = 'replaceChildren' in Element.prototype
function replaceChildren (parentNode, newChildren) {
  /* istanbul ignore else */
  if (hasReplaceChildren) {
    parentNode.replaceChildren(...newChildren)
  } else { // minimal polyfill for Element.prototype.replaceChildren
    parentNode.innerHTML = ''
    parentNode.append(...newChildren)
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
  /* istanbul ignore if */
  if (import.meta.env.MODE !== 'production' && oldChildrenCount !== parentNode.children.length) {
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
    instanceBinding.targetNode = undefined // placeholder node not needed anymore, free memory
    instanceBinding.targetParentNode = targetParentNode = targetNode.parentNode
  }
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
      if (Array.isArray(expression)) { // array of DOM elements produced by tag template literals
        patchChildren(expression, instanceBinding)
      } else if (expression instanceof Element) { // html tag template returning a DOM element
        newNode = expression
        /* istanbul ignore if */
        if (import.meta.env.MODE !== 'production' && newNode === targetNode) {
          // it seems impossible for the framework to get into this state, may as well assert on it
          // worst case scenario is we lose focus if we call replaceWith on the same node
          throw new Error('the newNode and targetNode are the same, this should never happen')
        }
        targetNode.replaceWith(newNode)
      } else { // primitive - string, number, etc
        // nodeValue is faster than textContent supposedly https://www.youtube.com/watch?v=LY6y3HbDVmg
        // note we may be replacing the value in a placeholder text node
        targetNode.nodeValue = toString(expression)
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
      break // no need to process characters - no more expressions to be found
    }

    for (let j = 0; j < token.length; j++) {
      const char = token.charAt(j)
      switch (char) {
        case '<': {
          const nextChar = token.charAt(j + 1)
          /* istanbul ignore if */
          if (import.meta.env.MODE !== 'production' && !/[/a-z]/.test(nextChar)) {
            // we don't need to support comments ('<!') because we always use html-minify-literals
            // also we don't support '<' inside tags, e.g. '<div> 2 < 3 </div>'
            throw new Error('framework currently only supports a < followed by / or a-z')
          }
          if (nextChar === '/') { // closing tag
            // leaving an element
            elementIndexes.pop()
          } else { // not a closing tag
            withinTag = true
            elementIndexes.push(++elementIndexCounter)
          }
          break
        }
        case '>': {
          withinTag = false
          withinAttribute = false
          break
        }
        case '=': {
          /* istanbul ignore if */
          if (import.meta.env.MODE !== 'production' && !withinTag) {
            // we don't currently support '=' anywhere but inside a tag, e.g.
            // we don't support '<div>2 + 2 = 4</div>'
            throw new Error('framework currently does not support = anywhere but inside a tag')
          }
          withinAttribute = true
          break
        }
      }
    }

    const elementIndex = elementIndexes[elementIndexes.length - 1]
    const bindings = getFromMap(elementsToBindings, elementIndex, () => [])

    let attributeName
    let attributeValuePre
    let attributeValuePost
    if (withinAttribute) {
      // I never use single-quotes for attribute values in HTML, so just support double-quotes or no-quotes
      const match = /(\S+)="?([^"=]*)$/.exec(token)
      attributeName = match[1]
      attributeValuePre = match[2]
      attributeValuePost = /^[^">]*/.exec(tokens[i + 1])[0]
    }

    const binding = {
      attributeName,
      attributeValuePre,
      attributeValuePost,
      expressionIndex: i
    }

    /* istanbul ignore else */
    if (import.meta.env.MODE !== 'production') {
      // remind myself that this object is supposed to be immutable
      Object.freeze(binding)
    }

    bindings.push(binding)

    if (!withinTag && !withinAttribute) {
      // Add a placeholder text node, so we can find it later. Note we only support one dynamic child text node
      htmlString += ' '
    }
  }

  const template = parseTemplate(htmlString)

  return {
    template,
    elementsToBindings
  }
}

function applyBindings (bindings, element, instanceBindings) {
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i]

    const targetNode = binding.attributeName
      ? element // attribute binding, just use the element itself
      : element.firstChild // not an attribute binding, so has a placeholder text node

    /* istanbul ignore if */
    if (import.meta.env.MODE !== 'production') {
      // We only support exactly one placeholder text node inside an element, which simplifies
      // the implementation a lot. Also, minify-html-literals should handle any whitespace
      // around the expression, so we should only ever see e.g. `<div>${expr}</div>`
      if (
        !binding.attributeName &&
          !(element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE)
      ) {
        throw new Error('framework only supports exactly one dynamic child text node')
      }

      if (!targetNode) {
        throw new Error('targetNode should not be undefined')
      }
    }

    const instanceBinding = {
      binding,
      targetNode,
      targetParentNode: undefined,
      currentExpression: undefined
    }

    /* istanbul ignore else */
    if (import.meta.env.MODE !== 'production') {
      // remind myself that this object is supposed to be monomorphic (for better JS engine perf)
      Object.seal(instanceBinding)
    }

    instanceBindings.push(instanceBinding)
  }
}

function traverseAndSetupBindings (rootElement, elementsToBindings) {
  const instanceBindings = []

  let topLevelBindings
  if (elementsToBindings.size === 1 && (topLevelBindings = elementsToBindings.get(0))) {
    // Optimization for the common case where there's only one element and one binding
    // Skip creating a TreeWalker entirely and just handle the root DOM element
    applyBindings(topLevelBindings, rootElement, instanceBindings)
  } else {
    // traverse dom
    const treeWalker = document.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT)

    let element = rootElement
    let elementIndex = -1
    do {
      const bindings = elementsToBindings.get(++elementIndex)
      if (bindings) {
        applyBindings(bindings, element, instanceBindings)
      }
    } while ((element = treeWalker.nextNode()))
  }

  return instanceBindings
}

function parseHtml (tokens) {
  // All templates and bound expressions are unique per tokens array
  const { template, elementsToBindings } = getFromMap(parseCache, tokens, () => parse(tokens))

  // When we parseHtml, we always return a fresh DOM instance ready to be updated
  const dom = template.cloneNode(true).content.firstElementChild
  const instanceBindings = traverseAndSetupBindings(dom, elementsToBindings)

  return function updateDomInstance (expressions) {
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
    const updateDomInstance = getFromMap(domInstancesForTokens, domInstanceCacheKey, () => parseHtml(tokens))

    return updateDomInstance(expressions) // update with expressions
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
