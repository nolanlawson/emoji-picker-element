import { Database } from '@nolanlawson/emoji-picker-element-for-tachometer'
import { dataSource } from './utils.js'

performance.mark('start-db-interactions')
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
