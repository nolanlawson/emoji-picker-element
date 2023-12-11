export const raf = () => new Promise(resolve => requestAnimationFrame(resolve))
export const postRaf = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)))

export const waitForElementWithId = async (root, id) => {
  while (!root.getElementById(id)) {
    await raf()
  }
}
