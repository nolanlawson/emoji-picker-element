// trie data structure for prefix searches
// loosely based on https://github.com/nolanlawson/substring-trie

const CODA_MARKER = '' // marks the end of the string

export function trie (arr, itemToTokens) {
  const map = new Map()
  for (const item of arr) {
    const tokens = itemToTokens(item)
    for (const token of tokens) {
      let currentMap = map
      for (let i = 0; i < token.length; i++) {
        const char = token.charAt(i)
        let nextMap = currentMap.get(char)
        if (!nextMap) {
          nextMap = new Map()
          currentMap.set(char, nextMap)
        }
        currentMap = nextMap
      }
      let valuesAtCoda = currentMap.get(CODA_MARKER)
      if (!valuesAtCoda) {
        valuesAtCoda = []
        currentMap.set(CODA_MARKER, valuesAtCoda)
      }
      valuesAtCoda.push(item)
    }
  }

  const search = (query, exact) => {
    let currentMap = map
    for (let i = 0; i < query.length; i++) {
      const char = query.charAt(i)
      const nextMap = currentMap.get(char)
      if (nextMap) {
        currentMap = nextMap
      } else {
        return []
      }
    }

    if (exact) {
      const results = currentMap.get(CODA_MARKER)
      return results || []
    }

    const results = []
    // traverse
    const queue = [currentMap]
    while (queue.length) {
      const currentMap = queue.shift()
      const entriesSortedByKey = [...currentMap.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1)
      for (const [key, value] of entriesSortedByKey) {
        if (key === CODA_MARKER) { // CODA_MARKER always comes first; it's the empty string
          results.push(...value)
        } else {
          queue.push(value)
        }
      }
    }
    return results
  }

  return search
}
