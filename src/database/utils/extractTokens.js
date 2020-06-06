export function extractTokens (str) {
  return str
    .split(/[\s_]+/)
    .map(word => {
      return word
        .replace(/[)(:,]/g, '')
        .replace(/’/g, "'")
        .toLowerCase()
    }).filter(Boolean)
}
