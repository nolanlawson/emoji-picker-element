import { dbPromise } from './databaseLifecycle'
import {
  INDEX_COUNT,
  INDEX_GROUP_AND_ORDER, INDEX_SKIN_UNICODE, INDEX_TOKENS, KEY_ETAG, KEY_URL,
  MODE_READONLY, MODE_READWRITE,
  STORE_EMOJI, STORE_FAVORITES,
  STORE_KEYVALUE
} from './constants'
import { transformEmojiData } from './utils/transformEmojiData'
import { extractTokens } from './utils/extractTokens'
import { getAllIDB, getIDB } from './idbUtil'
import { findCommonMembers } from './utils/findCommonMembers'
import { normalizeTokens } from './utils/normalizeTokens'

export async function isEmpty (db) {
  return !(await get(db, STORE_KEYVALUE, KEY_URL))
}

export async function hasData (db, url, eTag) {
  const [oldETag, oldUrl] = await Promise.all([KEY_ETAG, KEY_URL]
    .map(key => get(db, STORE_KEYVALUE, key)))
  return (oldETag === eTag && oldUrl === url)
}

async function doFullDatabaseScanForSingleResult (db, predicate) {
  // This batching algorithm is just a perf improvement over a basic
  // cursor. The BATCH_SIZE is an estimate of what would give the best
  // perf for doing a full DB scan (worst case).
  //
  // Mini-benchmark for determining the best batch size:
  //
  // PERF=1 yarn build:rollup && yarn test:adhoc
  //
  // (async () => {
  //   performance.mark('start')
  //   await $('emoji-picker').database.getEmojiByShortcode('doesnotexist')
  //   performance.measure('total', 'start')
  //   console.log(performance.getEntriesByName('total').slice(-1)[0].duration)
  // })()
  const BATCH_SIZE = 50 // Typically around 150ms for 6x slowdown in Chrome for above benchmark
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
    let lastKey

    const processNextBatch = () => {
      emojiStore.getAll(lastKey && IDBKeyRange.lowerBound(lastKey, true), BATCH_SIZE).onsuccess = e => {
        const results = e.target.result
        for (const result of results) {
          lastKey = result.unicode
          if (predicate(result)) {
            return cb(result)
          }
        }
        if (results.length < BATCH_SIZE) {
          return cb()
        }
        processNextBatch()
      }
    }
    processNextBatch()
  })
}

export async function loadData (db, emojiData, url, eTag) {
  performance.mark('loadData')
  try {
    const transformedData = transformEmojiData(emojiData)
    await dbPromise(db, [STORE_EMOJI, STORE_KEYVALUE], MODE_READWRITE, ([emojiStore, metaStore]) => {
      let oldETag
      let oldUrl
      let todo = 0

      function checkFetched () {
        if (++todo === 2) { // 2 requests made
          onFetched()
        }
      }

      function onFetched () {
        if (oldETag === eTag && oldUrl === url) {
          // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
          return
        }
        // delete old data
        emojiStore.clear()
        // insert new data
        for (const data of transformedData) {
          emojiStore.put(data)
        }
        metaStore.put(eTag, KEY_ETAG)
        metaStore.put(url, KEY_URL)
        performance.mark('commitAllData')
      }

      getIDB(metaStore, KEY_ETAG, result => {
        oldETag = result
        checkFetched()
      })

      getIDB(metaStore, KEY_URL, result => {
        oldUrl = result
        checkFetched()
      })
    })
    performance.measure('commitAllData', 'commitAllData')
  } finally {
    performance.measure('loadData', 'loadData')
  }
}

export async function getEmojiByGroup (db, group) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
    const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true)
    getAllIDB(emojiStore.index(INDEX_GROUP_AND_ORDER), range, cb)
  })
}

export async function getEmojiBySearchQuery (db, query) {
  const tokens = normalizeTokens(extractTokens(query))

  if (!tokens.length) {
    return []
  }

  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => {
    // get all results that contain all tokens (i.e. an AND query)
    const intermediateResults = []

    const checkDone = () => {
      if (intermediateResults.length === tokens.length) {
        onDone()
      }
    }

    const onDone = () => {
      const results = findCommonMembers(intermediateResults, _ => _.unicode)
      cb(results.sort((a, b) => a.order < b.order ? -1 : 1))
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const range = i === tokens.length - 1
        ? IDBKeyRange.bound(token, token + '\uffff', false, true) // treat last token as a prefix search
        : IDBKeyRange.only(token) // treat all other tokens as an exact match
      getAllIDB(emojiStore.index(INDEX_TOKENS), range, result => {
        intermediateResults.push(result)
        checkDone()
      })
    }
  })
}

// This could have been implemented as an IDB index on shortcodes, but it seemed wasteful to do that
// when we can already query by tokens and this will give us what we're looking for 99.9% of the time
export async function getEmojiByShortcode (db, shortcode) {
  const emojis = await getEmojiBySearchQuery(db, shortcode)

  // In very rare cases (e.g. the shortcode "v" as in "v for victory"), we cannot search because
  // there are no usable tokens (too short in this case). In that case, we have to do an inefficient
  // full-database scan, which I believe is an acceptable tradeoff for not having to have an extra
  // index on shortcodes.

  if (!emojis.length) {
    const predicate = _ => ((_.shortcodes || []).includes(shortcode.toLowerCase()))
    return (await doFullDatabaseScanForSingleResult(db, predicate)) || null
  }

  return emojis.filter(_ => {
    const lowerShortcodes = (_.shortcodes || []).map(_ => _.toLowerCase())
    return lowerShortcodes.includes(shortcode.toLowerCase())
  })[0] || null
}

export async function getEmojiByUnicode (db, unicode) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, cb) => (
    getIDB(emojiStore, unicode, result => {
      if (result) {
        return cb(result)
      }
      getIDB(emojiStore.index(INDEX_SKIN_UNICODE), unicode, result => cb(result || null))
    })
  ))
}

export function get (db, storeName, key) {
  return dbPromise(db, storeName, MODE_READONLY, (store, cb) => (
    getIDB(store, key, cb)
  ))
}

export function set (db, storeName, key, value) {
  return dbPromise(db, storeName, MODE_READWRITE, (store) => (
    store.put(value, key)
  ))
}

export function incrementFavoriteEmojiCount (db, unicode) {
  return dbPromise(db, STORE_FAVORITES, MODE_READWRITE, (store) => {
    getIDB(store, unicode, result => (
      store.put((result || 0) + 1, unicode)
    ))
  })
}

export function getTopFavoriteEmoji (db, customEmojiIndex, limit) {
  if (limit === 0) {
    return []
  }
  return dbPromise(db, [STORE_FAVORITES, STORE_EMOJI], MODE_READONLY, ([favoritesStore, emojiStore], cb) => {
    const results = []
    favoritesStore.index(INDEX_COUNT).openCursor(undefined, 'prev').onsuccess = e => {
      const cursor = e.target.result
      if (!cursor) { // no more results
        return cb(results)
      }

      function addResult (result) {
        results.push(result)
        if (results.length === limit) {
          return cb(results) // done, reached the limit
        }
        cursor.continue()
      }

      const unicodeOrName = cursor.primaryKey
      const custom = customEmojiIndex.byName(unicodeOrName)
      if (custom) {
        return addResult(custom)
      }
      // This could be done in parallel (i.e. make the cursor and the get()s parallelized),
      // but my testing suggests it's not actually faster.
      getIDB(emojiStore, unicodeOrName, emoji => {
        if (emoji) {
          return addResult(emoji)
        }
        // emoji not found somehow, ignore (may happen if custom emoji change)
        cursor.continue()
      })
    }
  })
}
