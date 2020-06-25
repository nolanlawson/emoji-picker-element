// Measure after style/layout are complete
// See https://github.com/andrewiggins/afterframe

import { requestAnimationFrame } from './requestAnimationFrame'

export const requestPostAnimationFrame = callback => {
  requestAnimationFrame(() => {
    setTimeout(callback)
  })
}
