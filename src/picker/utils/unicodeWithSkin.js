export const unicodeWithSkin = (emoji, currentSkinTone) => (
  (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
)