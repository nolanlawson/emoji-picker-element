function mergeArray (base, target) {
  const res = []
  for (let i = 0; i < base.length; i++) {
    res[i] = target[i] || base[i]
  }
  return res
}

function mergeObject (base, target) {
  const res = {}
  for (const [key, baseValue] of Object.entries(base)) {
    const targetValue = target[key]
    let mergedValue
    if (Array.isArray(baseValue)) {
      mergedValue = mergeArray(baseValue, targetValue)
    } else if (typeof baseValue === 'object') {
      mergedValue = mergeObject(baseValue, targetValue)
    } else { // primitive
      mergedValue = targetValue || baseValue
    }
    res[key] = mergedValue
  }
  return res
}

export function mergeI18n (base, target) {
  return mergeObject(base, target)
}
