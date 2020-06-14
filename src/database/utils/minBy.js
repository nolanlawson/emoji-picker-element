// like lodash's minBy
export function minBy (array, func) {
  let minItem = array[0]
  for (let i = 1; i < array.length; i++) {
    const item = array[i]
    if (func(minItem) > func(item)) {
      minItem = item
    }
  }
  return minItem
}
