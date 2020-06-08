import { basicAfterEach, basicBeforeEach } from './shared'
import allEmojis from 'emojibase-data/en/data.json'
import { applySkinTone } from '../../src/picker/utils/applySkinTone'

function showCodePoints(str) {
  var res = []
  for (var i = 0; i < str.length; i++) {
    res.push(str.charCodeAt(i))
  }
  return res
}

describe('skintones tests', () => {

  describe('data tests', () => {
    it('can compute unicode based on tones', () => {
      debugger
      const wrong = []
      const right = []
      for (const emojiData of allEmojis) {
        if (emojiData.skins) {
          for (const skin of emojiData.skins) {
            if (typeof skin.tone === 'number') {
              const actualUnicode = applySkinTone(emojiData.emoji, skin.tone)
              if (actualUnicode !== skin.emoji) {
                wrong.push({emojiData, actualUnicode})
              } else {
                right.push({emojiData, actualUnicode})
              }
              // expect(actualUnicode).toBe(skin.emoji)
            }
          }
        }
      }
      console.log('wrong', wrong.length, 'right', right.length)
    })
  })

  describe('ui tests', () => {
    beforeEach(basicBeforeEach)
    afterEach(basicAfterEach)
  })

})