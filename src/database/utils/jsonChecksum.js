import { binaryStringToArrayBuffer, arrayBufferToBinaryString } from 'blob-util'
import { mark, stop } from '../../shared/marks'

// generate a checksum based on a stable stringify of a JSON object
export async function jsonChecksum (object) {
  mark('jsonChecksum')
  const string = JSON.stringify(object)
  const buffer = binaryStringToArrayBuffer(string)
  const outBuffer = await crypto.subtle.digest('SHA-1', buffer)
  const outBinString = arrayBufferToBinaryString(outBuffer)
  const res = btoa(outBinString)
  stop('jsonChecksum')
  return res
}
