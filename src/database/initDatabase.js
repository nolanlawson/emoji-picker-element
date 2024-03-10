import { addOnCloseListener, openDatabase } from './databaseLifecycle.js'
import { isEmpty } from './idbInterface.js'
import { checkForUpdates, loadDataForFirstTime } from './dataLoading.js'

export async function initDatabase (dbName, dataSource, onClear, signal) {
  // signal.addEventListener('abort', () => {
  //   closeDatabase(dbName)
  // })
  const db = await openDatabase(dbName)
  addOnCloseListener(dbName, onClear)

  if (signal.aborted) {
    return
  }

  const empty = await isEmpty(db)

  if (signal.aborted) {
    return
  }

  if (empty) {
    await loadDataForFirstTime(db, dataSource, signal)
  } else { // offline-first - do an update asynchronously
    await checkForUpdates(db, dataSource, signal)
  }
  return db
}
