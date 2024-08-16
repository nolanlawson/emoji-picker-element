export const raf = () => new Promise(resolve => requestAnimationFrame(resolve))
export const postRaf = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)))

export const waitForElementWithId = async (root, id) => {
  while (!root.getElementById(id)) {
    await raf()
  }
}

export const dataSource = '/node_modules/emoji-picker-element-data/en/emojibase/data.json'
