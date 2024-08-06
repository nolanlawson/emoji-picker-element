import { assertEmojiData } from './database/utils/assertEmojiData'
import { requiredKeys } from './database/utils/requiredKeys'

const optionalKeys = ['skins', 'emoticon', 'shortcodes', 'tags']
const allKeys = [...requiredKeys, ...optionalKeys]

const allSkinsKeys = ['tone', 'emoji', 'version']

export default function trimEmojiData (emojiData) {
  console.warn('trimEmojiData() is deprecated and may be removed eventually. ' +
    'If you use emoji-picker-element-data instead of emojibase-data, there is no need for trimEmojiData(). ' +
    'For details, see: ' +
    'https://github.com/nolanlawson/emoji-picker-element/blob/master/README.md#trimming-the-emoji-data-deprecated'
  )
  assertEmojiData(emojiData)
  return emojiData.map(emoji => {
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
