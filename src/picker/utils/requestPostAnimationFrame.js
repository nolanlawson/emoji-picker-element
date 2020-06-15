// Measure after style/layout are complete
// See https://github.com/andrewiggins/afterframe

export const requestPostAnimationFrame = callback => {
  requestAnimationFrame(() => {
    setTimeout(callback)
  })
}
