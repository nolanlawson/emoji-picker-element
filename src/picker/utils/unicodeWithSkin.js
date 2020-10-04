export function unicodeWithSkin (emoji, currentSkinTone) {
  return (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
}
