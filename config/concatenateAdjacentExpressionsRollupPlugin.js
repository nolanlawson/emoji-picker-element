import MagicString from 'magic-string'

// Rollup plugin to concatenate adjacent expressions inside of html`` template literals
// for text nodes
// E.g. html`<div>1${a}2{b}3</div>` becomes html`<div>${'1' + a + '2' + b + '3'}</div>`

function concatenateAdjacentExpressions (string) {
  let count = 0
  const tokens = []
  let currentString = ''
  let i = 0

  const consumeStringLiteral = () => {
    if (currentString) {
      tokens.push(JSON.stringify(currentString))
      currentString = ''
    }
  }

  while (i < string.length) {
    count++
    if (count > 1000) {
      debugger
      throw new Error('stack overflow here')
    }
    const char = string.charAt(i)
    if (char === '$' && string.charAt(i + 1) === '{') {
      // any pre-existing chars are string literals
      consumeStringLiteral()
      // consume expression
      i += 2
      let expression = ''
      while (string.charAt(i) !== '}') {
        count++
        if (count > 1000) {
          debugger
          throw new Error('stack overflow here')
        }
        expression += string.charAt(i)
        i++
      }
      tokens.push(expression)
    } else {
      currentString += char
    }
    i++
  }

  consumeStringLiteral()

  return '>${' + tokens.join(' + ') + '}<'
}

export function concatenateAdjacentExpressionsRollupPlugin () {
  return {
    id: 'concatenate-adjacent-expressions',
    transform (content) {
      if (content.includes('html`')) {
        const magicString = new MagicString(content)

        const matchingHtmlTagTemplateLiterals = content.matchAll(/html`.*?`/sg)

        for (const match of matchingHtmlTagTemplateLiterals) {
          const substring = match[0]
          const { index } = match
          for (const subMatch of substring.matchAll(/>(.+?)</gs)) {
            const [ whole, arg1] = subMatch
            const { index: subIndex } = subMatch

            const replacement = concatenateAdjacentExpressions(arg1)

            magicString.update(index + subIndex, index + subIndex + whole.length, replacement)
          }
        }

        return {
          code: magicString.toString(),
          map: magicString.generateMap()
        }
      }
    }
  }
}