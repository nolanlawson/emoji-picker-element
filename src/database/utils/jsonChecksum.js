import { binaryStringToArrayBuffer, arrayBufferToBinaryString } from 'blob-util'
import { mark, stop } from '../../shared/marks'

// generate a checksum based on the stringified JSON
export async function jsonChecksum (object) {
  mark('jsonChecksum')
  const inString = JSON.stringify(object)
  const inBuffer = binaryStringToArrayBuffer(inString)
  const outBuffer = await crypto.subtle.digest('SHA-1', inBuffer)
  const outBinString = arrayBufferToBinaryString(outBuffer)
  const res = btoa(outBinString)
  stop('jsonChecksum')
  return res
}
