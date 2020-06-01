// like lodash's uniqBy but much smaller
export function uniqBy (arr, func) {
  const set = new Set()
  const res = []
  for (const item of arr) {
    const key = func(item)
    if (!set.has(key)) {
      set.add(key)
      res.push(item)
    }
  }
  return res
}
