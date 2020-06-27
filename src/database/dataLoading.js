import { getETag, getETagAndData } from './utils/ajax'
import { jsonChecksum } from './utils/jsonChecksum'
import { hasData, loadData } from './idbInterface'
import { log } from '../shared/log'

export async function checkForUpdates (db, dataSource) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiBaseData
  let eTag = await getETag(dataSource)
  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    const eTagAndData = await getETagAndData(dataSource)
    eTag = eTagAndData[0]
    emojiBaseData = eTagAndData[1]
    if (!eTag) {
      eTag = await jsonChecksum(emojiBaseData)
    }
  }
  if (await hasData(db, dataSource, eTag)) {
    log('Database already populated')
  } else {
    log('Database update available')
    if (!emojiBaseData) {
      const eTagAndData = await getETagAndData(dataSource)
      emojiBaseData = eTagAndData[1]
    }
    await loadData(db, emojiBaseData, dataSource, eTag)
  }
}

export async function loadDataForFirstTime (db, dataSource) {
  let [eTag, emojiBaseData] = await getETagAndData(dataSource)
  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiBaseData)
  }

  await loadData(db, emojiBaseData, dataSource, eTag)
}
