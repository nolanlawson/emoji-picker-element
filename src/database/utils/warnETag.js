export function warnETag (eTag) {
  if (!eTag) {
    console.warn('lite-emoji-picker is more efficient if the dataSource server exposes an ETag header.')
  }
}
