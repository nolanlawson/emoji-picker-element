import Database from '/database.js' // eslint-disable-line

/* global self */
self.addEventListener('message', async () => {
  const db = new Database({ dataSource: '/node_modules/emoji-picker-element/en/emojibase/data.json' })
  await db.ready()
  await db.close()
  self.postMessage('done')
})
