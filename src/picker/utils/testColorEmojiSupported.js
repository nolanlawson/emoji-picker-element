// Test if an emoji is supported by rendering it to canvas and checking that the color is not black
// See https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
// and https://www.npmjs.com/package/if-emoji for inspiration
// This implementation is largely borrowed from if-emoji, adding the font-family

/* istanbul ignore file */

import { FONT_FAMILY } from '../constants'
import { versionsAndTestEmoji } from '../../../bin/versionsAndTestEmoji'

// only used in jest/vitest tests
let simulateCanvasError = false
export function setSimulateCanvasError (value) {
  simulateCanvasError = value
}
let simulateOldBrowser = false
export function setSimulateOldBrowser (value) {
  simulateOldBrowser = value
}

const getTextFeature = (text, color) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1

  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = `100px ${FONT_FAMILY}`
  ctx.fillStyle = color
  ctx.scale(0.01, 0.01)
  ctx.fillText(text, 0, 0)

  return ctx.getImageData(0, 0, 1, 1).data
}

const compareFeatures = (feature1, feature2) => {
  const feature1Str = [...feature1].join(',')
  const feature2Str = [...feature2].join(',')
  // This is RGBA, so for 0,0,0, we are checking that the first RGB is not all zeroes.
  // Most of the time when unsupported this is 0,0,0,0, but on Chrome on Mac it is
  // 0,0,0,61 - there is a transparency here.
  return feature1Str === feature2Str && !feature1Str.startsWith('0,0,0,')
}

export function testColorEmojiSupported (text) {
  if (import.meta.env.MODE === 'test') {
    if (simulateCanvasError) {
      throw new Error('canvas error')
    } else if (simulateOldBrowser) {
      return Object.entries(versionsAndTestEmoji)
        .filter(([emoji, version]) => version < 12)
        .map(([emoji]) => emoji)
        .includes(text)
    }
    return true // avoid using canvas in jest/vitest
  }
  // Render white and black and then compare them to each other and ensure they're the same
  // color, and neither one is black. This shows that the emoji was rendered in color.
  const feature1 = getTextFeature(text, '#000')
  const feature2 = getTextFeature(text, '#fff')
  return feature1 && feature2 && compareFeatures(feature1, feature2)
}
