// like lodash's uniq
import { uniqBy } from './uniqBy'

export function uniq (arr) {
  return uniqBy(arr, _ => _)
}
