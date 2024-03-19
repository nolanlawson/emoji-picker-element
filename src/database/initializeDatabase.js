import { AbortError, abortOpportunity } from './utils/abortSignalUtils.js'
import { isEmpty } from './idbInterface.js'
import { checkForUpdates, loadDataForFirstTime } from './dataLoading.js'
import { addOnCloseListener, openDatabase } from './databaseLifecycle.js'

export async function initializeDatabase (dbName, dataSource, onClear, signal) {
  const db = await openDatabase(dbName)
  addOnCloseListener(dbName, onClear)
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    await abortOpportunity()
  }
  if (signal.aborted) {
    throw new AbortError()
  }

  const empty = await isEmpty(db)
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    await abortOpportunity()
  }
  if (signal.aborted) {
    throw new AbortError()
  }

  let lazyUpdate
  if (empty) {
    await loadDataForFirstTime(db, dataSource, signal)
  } else { // offline-first - do an update asynchronously
    lazyUpdate = checkForUpdates(db, dataSource, signal)
  }
  return { db, lazyUpdate }
}
