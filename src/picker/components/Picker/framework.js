import { escapeHtml, getFromMap, parseTemplate, toString } from './utils.js'

const domInstancesCache = new WeakMap()
const unkeyedSymbol = Symbol('un-keyed')

function patchChildren (newChildren, binding) {
  const { targetNode } = binding
  let { iteratorEndNode } = binding
  const { parentNode } = targetNode

  let needsRerender = false

  if (iteratorEndNode) { // already rendered once
    let currentSibling = targetNode.nextSibling
    let i = -1
    let oldChildrenCount = 0
    while (!(currentSibling.nodeType === Node.COMMENT_NODE && currentSibling.textContent === 'end')) {
      oldChildrenCount++
      const oldSibling = currentSibling
      currentSibling = currentSibling.nextSibling
      const newChild = newChildren[++i]
      // check if the old children and new children are the same
      if (!(newChild && newChild.dom === oldSibling)) {
        needsRerender = true
        parentNode.removeChild(oldSibling)
      }
    }
    if (oldChildrenCount !== newChildren.length) { // new children length is different from old, force re-render
      needsRerender = true
    }
  } else { // first render of list
    needsRerender = true
    iteratorEndNode = document.createComment('end')
    parentNode.insertBefore(iteratorEndNode, targetNode.nextSibling)
    binding.iteratorEndNode = iteratorEndNode
  }
  // avoid re-rendering list if the dom nodes are exactly the same before and after
  if (needsRerender) {
    for (const subExpression of newChildren) {
      if (subExpression && subExpression.dom) { // html tag template itself
        parentNode.insertBefore(subExpression.dom, iteratorEndNode)
      } else { // primitive - string, number, etc
        const textNode = document.createTextNode(toString(subExpression))
        parentNode.insertBefore(textNode, iteratorEndNode)
      }
    }
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
      element.setAttribute(attributeName, attributeValuePre + escapeHtml(toString(expression)) + attributeValuePost)
    } else { // text node / dom node replacement
      let newNode
      if (expression && Array.isArray(expression)) { // array of html tag templates
        patchChildren(expression, binding)
      } else if (expression && expression.dom) { // html tag template itself
        newNode = expression.dom
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

function createUpdater (dom, boundExpressions) {
  traverseAndSetupBindings(dom, boundExpressions)
  const allBindings = [...boundExpressions.values()].flat()
  return expressions => patch(expressions, allBindings)
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
    boundExpressions
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

function cloneBoundExpressions (boundExpressions) {
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
          if (process.env.NODE_ENV !== 'production' && !binding.targetNode) {
            throw new Error('should not be undefined')
          }
        }
      }
    }
  } while ((element = treeWalker.nextNode()))
}

function parseHtml (tokens) {
  const {
    template,
    boundExpressions
  } = parseWithCache(tokens)

  let updater
  let dom

  const update = (expressions) => {
    if (!updater) {
      dom = template.cloneNode(true).content.firstElementChild
      const clonedBoundExpressions = cloneBoundExpressions(boundExpressions)
      updater = createUpdater(dom, clonedBoundExpressions)
    }
    updater(expressions)

    return { dom }
  }

  return {
    update
  }
}

export function createFramework (state) {
  let domInstances = getFromMap(domInstancesCache, state, () => new Map())
  let iteratorKey = unkeyedSymbol

  function html (tokens, ...expressions) {
    const domInstancesForKey = getFromMap(domInstances, iteratorKey, () => new WeakMap())
    const domInstance = getFromMap(domInstancesForKey, tokens, () => parseHtml(tokens))

    const { update } = domInstance
    const { dom } = update(expressions)
    return { dom }
  }

  function map (array, callback, keyFunction, mapKey) {
    const originalCacheKey = iteratorKey
    const originalDomInstances = domInstances
    domInstances = getFromMap(domInstances, mapKey, () => new Map())
    try {
      return array.map((item, index) => {
        iteratorKey = keyFunction(item)
        return callback(item, index)
      })
    } finally {
      iteratorKey = originalCacheKey
      domInstances = originalDomInstances
    }
  }

  return { map, html }
}
