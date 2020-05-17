// check for ZWJ (zero width joiner) character
export function hasZwj (emoji) {
  return emoji.unicode.includes('\u200d')
}
