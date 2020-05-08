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
