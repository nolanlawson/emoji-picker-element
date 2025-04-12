import { getETag, getETagAndData } from './utils/ajax'
import { jsonChecksum } from './utils/jsonChecksum'
import { hasData, loadData } from './idbInterface'

async function doCheckForUpdates (db, dataSource) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiData
  let eTag = await getETag(dataSource)
  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    const eTagAndData = await getETagAndData(dataSource)
    eTag = eTagAndData[0]
    emojiData = eTagAndData[1]
    if (!eTag) {
      eTag = await jsonChecksum(emojiData)
    }
  }
  if (await hasData(db, dataSource, eTag)) {
    console.log('Database already populated')
  } else {
    console.log('Database update available')
    if (!emojiData) {
      const eTagAndData = await getETagAndData(dataSource)
      emojiData = eTagAndData[1]
    }
    await loadData(db, emojiData, dataSource, eTag)
  }
}

export async function loadDataForFirstTime (db, dataSource) {
  let [eTag, emojiData] = await getETagAndData(dataSource)
  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiData)
  }

  await loadData(db, emojiData, dataSource, eTag)
}

export async function checkForUpdates (db, dataSource) {
  try {
    await doCheckForUpdates(db, dataSource)
  } catch (err) {
    // Checking for updates is not a critical operation, and it can fail if e.g. the picker is quickly removed and
    // re-added to the DOM. In those cases, we may get an IndexedDB InvalidStateError because we are attempting to close
    // the database connection, possibly while another request is inflight. So there's effectively no way to prevent
    // InvalidStateErrors unless we were to carefully sequence our IndexedDB operations. Much more simply, we can just
    // ignore IndexedDB InvalidStateErrors here and give users one less useless error message in their console.
    if (err.name !== 'InvalidStateError') {
      throw err
    }
  }
}
