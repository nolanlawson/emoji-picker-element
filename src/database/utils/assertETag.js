export function assertETag (eTag) {
  if (!eTag) {
    throw new Error('lite-emoji-picker expects the dataSource server to return an eTag header')
  }
}
