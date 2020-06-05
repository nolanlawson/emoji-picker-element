import { warnETag } from './warnETag'
import { assertEmojiBaseData } from './assertEmojiBaseData'

export async function getETag (dataSource) {
  const response = await fetch(dataSource, { method: 'HEAD' })
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  return eTag
}

export async function getETagAndData (dataSource) {
  const response = await fetch(dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  const emojiBaseData = await response.json()
  assertEmojiBaseData(emojiBaseData)
  return [eTag, emojiBaseData]
}
