import { IndexedDBEngine } from './IndexedDBEngine'

let idbEngine

async function init () {
  if (!idbEngine) {
    idbEngine = new IndexedDBEngine()
    await idbEngine.readyPromise
  }
}

export async function loadData (emojiBaseData) {
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

export async function searchEmojiByPrefix (prefix) {
  if (typeof prefix !== 'string' || !prefix) {
    throw new Error('expected a non-empty string, got: ' + prefix)
  }
  await init()
  return idbEngine.searchEmojiByPrefix(prefix)
}
