// remove some internal implementation details, i.e. the "tokens" array on the emoji object
export function cleanEmoji (emoji) {
  if (!emoji) {
    return emoji
  }
  const res = {}
  for (const [key, value] of Object.entries(emoji)) {
    if (key !== 'tokens') {
      res[key] = value
    }
  }
  return res
}
