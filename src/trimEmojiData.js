import { assertEmojiBaseData } from './database/utils/assertEmojiBaseData'
import { requiredKeys } from './database/utils/requiredKeys'

const optionalKeys = ['skins', 'emoticon']
const allKeys = [...requiredKeys, ...optionalKeys]

const allSkinsKeys = ['tone', 'emoji', 'version']

export default function trimEmojiData (emojiBaseData) {
  assertEmojiBaseData(emojiBaseData)
  return emojiBaseData.map(emoji => {
    const res = {}
    for (const key of allKeys) {
      if (key in emoji) {
        if (key === 'skins') { // trim skins even further
          res[key] = emoji[key].map(skin => {
            const skinRes = {}
            for (const skinKey of allSkinsKeys) {
              skinRes[skinKey] = skin[skinKey]
            }
            return skinRes
          })
        } else {
          res[key] = emoji[key]
        }
      }
    }
    return res
  })
};
