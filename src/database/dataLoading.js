import { getETag, getETagAndData } from './utils/ajax'
import { jsonChecksum } from './utils/jsonChecksum'
import { hasData, loadData } from './idbInterface'

export async function checkForUpdates (db, dataSource, signal) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiData
  let eTag = await getETag(dataSource)
  if (signal.aborted) {
    return
  }

  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    console.info('A get etag, aborted=', signal.aborted)
    const eTagAndData = await getETagAndData(dataSource)
    console.info('A got etag, aborted=', signal.aborted)
    if (signal.aborted) {
      console.info('A returning early')
      return
    }

    eTag = eTagAndData[0]
    emojiData = eTagAndData[1]
    if (!eTag) {
      eTag = await jsonChecksum(emojiData)
      if (signal.aborted) {
        return
      }
    }
  }
  const doesHaveData = await hasData(db, dataSource, eTag)
  if (signal.aborted) {
    return
  }

  if (doesHaveData) {
    console.log('Database already populated')
  } else {
    console.log('Database update available')
    if (!emojiData) {
      console.info('B get etag, aborted=', signal.aborted)
      const eTagAndData = await getETagAndData(dataSource)
      console.info('B got etag, aborted=', signal.aborted)
      if (signal.aborted) {
        console.info('B returning early')
        return
      }

      emojiData = eTagAndData[1]
    }
    await loadData(db, emojiData, dataSource, eTag)
  }
}

export async function loadDataForFirstTime (db, dataSource, signal) {
  let [eTag, emojiData] = await getETagAndData(dataSource)
  if (signal.aborted) {
    return
  }

  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiData)
    if (signal.aborted) {
      return
    }
  }

  await loadData(db, emojiData, dataSource, eTag)
}
