import { assertEmojiBaseData } from './database/utils/assertEmojiBaseData'
import { requiredKeys } from './database/utils/requiredKeys'

const optionalKeys = ['skins', 'emoticon']
const allKeys = [...requiredKeys, ...optionalKeys]

export default function trimEmojiData (emojiBaseData) {
  assertEmojiBaseData(emojiBaseData)
  return emojiBaseData.map(emoji => {
    const res = {}
    for (const key of allKeys) {
      if (key in emoji) {
        res[key] = emoji[key]
      }
    }
    return res
  })
};
