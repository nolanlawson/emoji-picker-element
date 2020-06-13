import { uniqBy } from '../../shared/uniqBy'

export function uniqEmoji (emojis) {
  return uniqBy(emojis, _ => _.unicode)
}
