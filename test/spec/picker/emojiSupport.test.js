import { determineEmojiSupportLevel } from '../../../src/picker/utils/determineEmojiSupportLevel'
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'
import { setSimulateCanvasError, setSimulateOldBrowser } from '../../../src/picker/utils/testColorEmojiSupported'

describe('emoji support', () => {
  test('returns latest emoji', () => {
    const version = determineEmojiSupportLevel()
    expect(version).toEqual(Math.max(...Object.values(versionsAndTestEmoji)))
  })

  describe('canvas error', () => {
    beforeEach(() => {
      setSimulateCanvasError(true)
    })

    afterEach(() => {
      setSimulateCanvasError(false)
    })

    test('returns latest emoji when there is a canvas error', () => {
      const version = determineEmojiSupportLevel()
      expect(version).toEqual(Math.max(...Object.values(versionsAndTestEmoji)))
    })
  })

  describe('old browser', () => {
    beforeEach(() => {
      setSimulateOldBrowser(true)
    })

    afterEach(() => {
      setSimulateOldBrowser(false)
    })

    test('returns older emoji version for older browser', () => {
      const version = determineEmojiSupportLevel()
      expect(version).toEqual(11)
    })
  })
})
