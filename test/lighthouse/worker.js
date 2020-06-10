importScripts('/database-bundle.js')

/* global self */
self.addEventListener('message', async () => {
  const db = new EmojiPickerDatabase({ dataSource: '/node_modules/emojibase-data/en/data.json' })
  await db.ready()
  await db.close()
  self.postMessage('done')
})
