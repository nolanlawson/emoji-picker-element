export const raf = () => new Promise(resolve => requestAnimationFrame(resolve))
export const postRaf = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve)))

export const waitForElementWithId = async (root, id) => {
  while (!root.getElementById(id)) {
    await raf()
  }
}

export const waitForPickerInitialLoad = () => {
  return new Promise((resolve, reject) => {
    const observer = new PerformanceObserver(entries => {
      for (const entry of entries.getEntries()) {
        if (entry.name === 'initialLoad') {
          // test to make sure the picker loaded with no errors
          const hasErrors = document.querySelector('emoji-picker') && document.querySelector('emoji-picker')
            .shadowRoot.querySelector('.message:not(.gone)')
          if (hasErrors) {
            const err = new Error('picker is showing an error message')
            console.error(err)
            reject(err)
          } else {
            resolve(entry)
          }
          observer.disconnect()
        }
      }
    })
    observer.observe({ entryTypes: ['measure'] })
  })
}

export const dataSource = '/node_modules/emoji-picker-element-data/en/emojibase/data.json'
