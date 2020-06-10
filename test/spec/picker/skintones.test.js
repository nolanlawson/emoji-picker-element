import allEmojis from 'emojibase-data/en/data.json'
import { applySkinTone } from '../../../src/picker/utils/applySkinTone'

describe('skintones tests', () => {
  describe('data tests', () => {
    test.skip('can compute unicode based on tones', () => {
      const debugIt = (str) => {
        const res = []
        for (let i = 0; i < str.length; i++) {
          res.push(str.charCodeAt(i).toString(16))
        }
        return res
      }
      const wrong = []
      const right = []
      for (const emoji of allEmojis) {
        if (emoji.skins) {
          for (const skin of emoji.skins) {
            if (typeof skin.tone === 'number') {
              const actualUnicode = applySkinTone(emoji.emoji, skin.tone)
              if (actualUnicode !== skin.emoji) {
                wrong.push({ emoji, actualUnicode, skin })
                applySkinTone(emoji.emoji, skin.tone)
              } else {
                right.push({ emoji, actualUnicode, skin })
              }
              // expect(actualUnicode).toBe(skin.emoji)
            }
          }
        }
      }
      console.log('wrong', wrong.length, 'right', right.length)
      for (const w of wrong) {
        console.log('\n' + debugIt(w.emoji.emoji).join(',') + '\n' +
          debugIt(w.skin.emoji).join(',') + '\n' +
          debugIt(w.actualUnicode).join(',') + '\n\n')
      }
    })
  })
})
