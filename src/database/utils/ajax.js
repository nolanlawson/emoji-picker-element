import { warnETag } from './warnETag'
import { assertEmojiBaseData } from './assertEmojiBaseData'
import { mark, stop } from '../../shared/marks'

function assertStatus (response, dataSource) {
  if (Math.floor(response.status / 100) !== 2) {
    throw new Error('Failed to fetch: ' + dataSource + ':  ' + response.status)
  }
}

export async function getETag (dataSource) {
  mark('getETag')
  const response = await fetch(dataSource, { method: 'HEAD' })
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  stop('getETag')
  return eTag
}

export async function getETagAndData (dataSource) {
  mark('getETagAndData')
  const response = await fetch(dataSource)
  assertStatus(response, dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  const emojiBaseData = await response.json()
  assertEmojiBaseData(emojiBaseData)
  stop('getETagAndData')
  return [eTag, emojiBaseData]
}
