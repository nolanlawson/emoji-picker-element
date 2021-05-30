import { binaryStringToArrayBuffer, arrayBufferToBinaryString } from 'blob-util'

// generate a checksum based on the stringified JSON
export async function jsonChecksum (object) {
  performance.mark('jsonChecksum')
  const inString = JSON.stringify(object)
  const inBuffer = binaryStringToArrayBuffer(inString)
  // this does not need to be cryptographically secure, SHA-1 is fine
  const outBuffer = await crypto.subtle.digest('SHA-1', inBuffer)
  const outBinString = arrayBufferToBinaryString(outBuffer)
  const res = btoa(outBinString)
  performance.measure('jsonChecksum', 'jsonChecksum')
  return res
}
