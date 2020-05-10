import { IndexedDBEngine } from './IndexedDBEngine'

let idbEngine

function verifyNonEmptyString (str) {
  if (typeof str !== 'string' || !str) {
    throw new Error('expected a non-empty string, got: ' + str)
  }
}

async function init () {
  if (!idbEngine) {
    idbEngine = new IndexedDBEngine()
    await idbEngine.readyPromise
  }
}

export async function loadData (emojiBaseData) {
  if (!emojiBaseData || !Array.isArray(emojiBaseData)) {
    throw new Error('Expected emojibase data, got: ' + emojiBaseData)
  }
  await init()
  await idbEngine.loadData(emojiBaseData)
}

export async function getEmojiByGroup (group) {
  if (typeof group !== 'number') {
    throw new Error('group must be a number, got: ' + group)
  }
  await init()
  return idbEngine.getEmojiByGroup(group)
}

export async function getEmojiBySearchPrefix (prefix) {
  verifyNonEmptyString(prefix)
  await init()
  return idbEngine.getEmojiBySearchPrefix(prefix)
}

export async function getEmojiByShortcode (shortcode) {
  verifyNonEmptyString(shortcode)
  await init()
  return idbEngine.getEmojiByShortcode(shortcode)
}

export async function getEmojiByUnicode (unicode) {
  verifyNonEmptyString(unicode)
  await init()
  return idbEngine.getEmojiByUnicode(unicode)
}

export async function closeDatabase () {
  if (idbEngine) {
    await idbEngine.readyPromise
    await idbEngine.close()
    idbEngine = undefined
  }
}
