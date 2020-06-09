import Database from '/database.js' // eslint-disable-line

/* global self */
self.addEventListener('message', async () => {
  const db = new Database({ dataSource: '/node_modules/emojibase-data/en/data.json' })
  await db.ready()
  await db.close()
  self.postMessage('done')
})
