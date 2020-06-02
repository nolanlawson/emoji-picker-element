import stringify from 'fast-json-stable-stringify'
import { binaryStringToArrayBuffer, arrayBufferToBinaryString } from 'blob-util'

// generate a checksum based on a stable stringify of a JSON object
export async function jsonChecksum (object) {
  const string = stringify(object)
  const buffer = binaryStringToArrayBuffer(string)
  const outBuffer = await crypto.subtle.digest('SHA-1', buffer)
  const outBinString = arrayBufferToBinaryString(outBuffer)
  return btoa(outBinString)
}
