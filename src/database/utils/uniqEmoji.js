import uniqBy from 'lodash-es/uniqBy'

export function uniqEmoji (emojis) {
  return uniqBy(emojis, _ => _.unicode)
}
