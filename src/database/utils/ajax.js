import { warnETag } from './warnETag'
import { assertEmojiBaseData } from './assertEmojiBaseData'
import { mark, stop } from '../../shared/marks'

export async function getETag (dataSource) {
  mark('getETag')
  const response = await fetch(dataSource, { method: 'HEAD' })
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  stop('getETag')
  return eTag
}

export async function getETagAndData (dataSource) {
  mark('getETagAndData')
  const response = await fetch(dataSource)
  const eTag = response.headers.get('etag')
  warnETag(eTag)
  const emojiBaseData = await response.json()
  assertEmojiBaseData(emojiBaseData)
  stop('getETagAndData')
  return [eTag, emojiBaseData]
}
