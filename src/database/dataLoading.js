import { getETag, getETagAndData } from './utils/ajax'
import { jsonChecksum } from './utils/jsonChecksum'
import { hasData, loadData } from './idbInterface'
import { abortOpportunity } from './utils/abortSignalUtils.js'

export async function checkForUpdates (db, dataSource, signal) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiData
  let eTag = await getETag(dataSource, signal)

  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    const eTagAndData = await getETagAndData(dataSource, signal)
    /* istanbul ignore else */
    if (import.meta.env.MODE === 'test') {
      await abortOpportunity()
    }
    if (signal.aborted) {
      return
    }

    eTag = eTagAndData[0]
    emojiData = eTagAndData[1]
    if (!eTag) {
      eTag = await jsonChecksum(emojiData, signal)
      /* istanbul ignore else */
      if (import.meta.env.MODE === 'test') {
        await abortOpportunity()
      }
      if (signal.aborted) {
        return
      }
    }
  }
  const doesHaveData = await hasData(db, dataSource, eTag)
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    await abortOpportunity()
  }
  if (signal.aborted) {
    return
  }

  if (doesHaveData) {
    console.log('Database already populated')
  } else {
    console.log('Database update available')
    if (!emojiData) {
      const eTagAndData = await getETagAndData(dataSource, signal)
      /* istanbul ignore else */
      if (import.meta.env.MODE === 'test') {
        await abortOpportunity()
      }
      if (signal.aborted) {
        return
      }

      emojiData = eTagAndData[1]
    }
    await loadData(db, emojiData, dataSource, eTag)
  }
}

export async function loadDataForFirstTime (db, dataSource, signal) {
  let [eTag, emojiData] = await getETagAndData(dataSource, signal)

  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiData, signal)
    /* istanbul ignore else */
    if (import.meta.env.MODE === 'test') {
      await abortOpportunity()
    }
    if (signal.aborted) {
      return
    }
  }

  await loadData(db, emojiData, dataSource, eTag)
}
