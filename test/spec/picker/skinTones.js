import allEmojis from 'emojibase-data/en/data.json'
import { applySkinTone } from '../../../src/picker/utils/applySkinTone'

describe('skin tones tests', () => {
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
      console.log('\n' + w.emoji.emoji + '\n' + debugIt(w.emoji.emoji).join(',') + '\n' +
        debugIt(w.skin.emoji).join(',') + '\n' +
        debugIt(w.actualUnicode).join(',') + '\n\n')
    }
    console.log('Right')
    for (const r of right) {
      console.log('\n' + r.emoji.emoji + '\n' + debugIt(r.emoji.emoji).join(',') + '\n' +
        debugIt(r.skin.emoji).join(',') + '\n' +
        debugIt(r.actualUnicode).join(',') + '\n\n')
    }
  })

  test('can compute some correct unicode tones', () => {
    expect(applySkinTone('👍', 0)).toBe('👍')
    expect(applySkinTone('👍', 3)).toBe('👍🏽')
    expect(applySkinTone('🧘‍♀️', 3)).toBe('🧘🏽‍♀️')
    expect(applySkinTone('🤌', 2)).toBe('🤌🏼')
    expect(applySkinTone('🖐️', 5)).toBe('🖐🏿')
  })
})
