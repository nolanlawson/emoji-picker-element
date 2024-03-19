import { warnETag } from './warnETag'
import { assertEmojiData } from './assertEmojiData'
import { abortOpportunity } from './abortSignalUtils.js'

function assertStatus (response, dataSource) {
  if (Math.floor(response.status / 100) !== 2) {
    throw new Error('Failed to fetch: ' + dataSource + ':  ' + response.status)
  }
}

export async function getETag (dataSource, signal) {
  performance.mark('getETag')
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    await abortOpportunity() // the fetch will error if the signal is aborted
  }
  const response = await fetch(dataSource, { method: 'HEAD', signal })
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  performance.measure('getETag', 'getETag')
  return eTag
}

export async function getETagAndData (dataSource, signal) {
  performance.mark('getETagAndData')
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    await abortOpportunity() // the fetch will error if the signal is aborted
  }
  const response = await fetch(dataSource, { signal })
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  const emojiData = await response.json()
  assertEmojiData(emojiData)
  performance.measure('getETagAndData', 'getETagAndData')
  return [eTag, emojiData]
}
