import Database from './database.js'

performance.mark('start-db-interactions')
const dataSource = './data.json'
const database = new Database({ dataSource })
await database.ready()

for (let i = 0; i < 10; i++) {
  await database.getEmojiByUnicodeOrName('💥')
  await database.getEmojiBySearchQuery('boom')
  await database.getEmojiByShortcode('boom')
  await database.getEmojiByGroup(1)
  await database.getPreferredSkinTone()
  await database.getTopFavoriteEmoji(10)
  await database.incrementFavoriteEmojiCount('💥')
  await database.setPreferredSkinTone(0)
}

performance.measure('benchmark-total', 'start-db-interactions')
