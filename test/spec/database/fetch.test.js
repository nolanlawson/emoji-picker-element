import { ALL_EMOJI, ALL_EMOJI_NO_ETAG, basicAfterEach, basicBeforeEach, truncatedEmoji } from '../shared'

describe('basic fetch tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  test('make sure fetch-mock is working correctly', async () => {
    expect(fetch.calls().length).toBe(0)
    const resp = await fetch(ALL_EMOJI)
    expect(resp.headers.get('etag')).toBe('W/xxx')
    expect(await (resp).json()).toEqual(truncatedEmoji)
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)
  })

  test('make sure fetch-mock is working correctly 2', async () => {
    expect(fetch.calls().length).toBe(0)
    const resp = await fetch(ALL_EMOJI_NO_ETAG)
    expect(resp.headers.get('etag')).toBeFalsy()
    expect(await (resp).json()).toEqual(truncatedEmoji)
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI_NO_ETAG)
    expect(fetch.lastOptions()).toBe(undefined)
  })

  test('make sure fetch-mock is working correctly 3', async () => {
    expect(fetch.calls().length).toBe(0)
    const resp = await fetch(ALL_EMOJI, { method: 'HEAD' })
    expect(resp.headers.get('etag')).toBe('W/xxx')
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions().method).toBe('HEAD')
  })
})
