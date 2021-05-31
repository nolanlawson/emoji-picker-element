import { warnETag } from './warnETag'
import { assertEmojiData } from './assertEmojiData'

function assertStatus (response, dataSource) {
  if (Math.floor(response.status / 100) !== 2) {
    throw new Error('Failed to fetch: ' + dataSource + ':  ' + response.status)
  }
}

export async function getETag (dataSource) {
  performance.mark('getETag')
  const response = await fetch(dataSource, { method: 'HEAD' })
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  performance.measure('getETag', 'getETag')
  return eTag
}

export async function getETagAndData (dataSource) {
  performance.mark('getETagAndData')
  const response = await fetch(dataSource)
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  const emojiData = await response.json()
  assertEmojiData(emojiData)
  performance.measure('getETagAndData', 'getETagAndData')
  return [eTag, emojiData]
}
