import { warn } from '../../shared/log'

export function warnETag (eTag) {
  if (!eTag) {
    warn('emoji-picker-element is more efficient if the dataSource server exposes an ETag header.')
  }
}
