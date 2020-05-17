import allEmoji from 'emojibase-data/en/data.json'

const versions = [...new Set(allEmoji.map(_ => _.version))].sort((a, b) => a < b ? -1 : 1)

export const versionsAndTestEmoji = versions.map(version => {
  // find one good representative emoji to test. Ideally its should be one that's short
  const emoji = allEmoji.find(_ => _.version === version).emoji
  return {
    emoji,
    version
  }
})
