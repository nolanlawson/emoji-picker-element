// via https://unpkg.com/browse/emojibase-data@5.0.1/meta/groups.json
export const categories = [
  [0, '😀', 'smileys-emotion'],
  [1, '👋', 'people-body'],
  [3, '🐱', 'animals-nature'],
  [4, '🍎', 'food-drink'],
  [5, '🏠️', 'travel-places'],
  [6, '⚽', 'activities'],
  [7, '✏', 'objects'],
  [8, '✅', 'symbols'],
  [9, '🏁', 'flags']
].map(([group, emoji, name]) => ({ group, emoji, name }))
