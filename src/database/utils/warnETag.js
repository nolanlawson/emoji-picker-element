
export function warnETag (eTag) {
  if (!eTag) {
    console.warn('emoji-picker-element is more efficient if the dataSource server exposes an ETag header.')
  }
}
