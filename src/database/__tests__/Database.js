/* global test expect */
import Database from '../Database'
import fetchMock from 'fetch-mock-jest'
import { Response } from 'node-fetch'
import allEmoji from 'emojibase-data/en/data.json'

const truncatedEmoji = allEmoji.slice(0, 100)

const ALL_EMOJI = 'http://localhost/emoji.json'
const ALL_EMOJI_NO_ETAG = 'http://localhost/emoji-no-etag.json'

fetchMock
  .get(ALL_EMOJI, new Response(JSON.stringify(truncatedEmoji), {
    headers: {
      ETag: 'W/xxx',
      'Content-Type': 'application/json'
    }
  }))
  .get(ALL_EMOJI_NO_ETAG, new Response(JSON.stringify(truncatedEmoji), {
    headers: {
      'Content-Type': 'application/json'
    }
  }))

test('basic emoji database test', async () => {
  const db = new Database({
    dataSource: ALL_EMOJI,
    locale: 'en'
  })
  const emojis = await db.getEmojiBySearchPrefix('smile')
  expect(emojis.length).toBe(13)
  await db.delete()
})
