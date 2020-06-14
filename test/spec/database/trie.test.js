import { trie } from '../../../src/database/utils/trie'

describe('trie tests', () => {
  test('basic trie test', () => {
    const mapper = _ => ([_])
    const items = ['ban', 'bananas', 'banana', 'tomato', 'bandana', 'bandanas']

    const { byPrefix, byExactMatch } = trie(items, mapper)

    expect(byPrefix('banan')).toStrictEqual(['banana', 'bananas'])
    expect(byPrefix('ban')).toStrictEqual(['ban', 'banana', 'bananas', 'bandana', 'bandanas'])
    expect(byPrefix('bananaphone')).toStrictEqual([])
    expect(byPrefix('band')).toStrictEqual(['bandana', 'bandanas'])
    expect(byPrefix('banana')).toStrictEqual(['banana', 'bananas'])
    expect(byPrefix('bananas')).toStrictEqual(['bananas'])

    expect(byExactMatch('banan')).toStrictEqual([])
    expect(byExactMatch('ban')).toStrictEqual(['ban'])
    expect(byExactMatch('bananaphone')).toStrictEqual([])
    expect(byExactMatch('band')).toStrictEqual([])
    expect(byExactMatch('banana')).toStrictEqual(['banana'])
    expect(byExactMatch('bananas')).toStrictEqual(['bananas'])
  })

  test('multiple results for same token', () => {
    const mapper = _ => _.split(/\s+/)
    const items = ['banana phone', 'banana split', 'gone bananas', 'bunch of bananas']

    const { byPrefix, byExactMatch } = trie(items, mapper)

    expect(byPrefix('ban').sort()).toStrictEqual(items.sort())
    expect(byPrefix('banana').sort()).toStrictEqual(items.sort())

    expect(byExactMatch('ban')).toStrictEqual([])
    expect(byExactMatch('banana').sort()).toStrictEqual(['banana phone', 'banana split'].sort())
    expect(byExactMatch('bananas').sort()).toStrictEqual(['gone bananas', 'bunch of bananas'].sort())
  })
})
