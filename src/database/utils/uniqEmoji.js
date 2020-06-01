import { uniqBy } from './uniqBy'

export function uniqEmoji (emojis) {
  return uniqBy(emojis, _ => _.unicode)
}
