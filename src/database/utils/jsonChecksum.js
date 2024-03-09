import { binaryStringToArrayBuffer, arrayBufferToBinaryString } from 'blob-util'

// generate a checksum based on the stringified JSON
export async function jsonChecksum (object) {
  performance.mark('jsonChecksum')
  const inString = JSON.stringify(object)
  let inBuffer = binaryStringToArrayBuffer(inString)
  /* istanbul ignore else */
  if (import.meta.env.MODE === 'test') {
    // Issue with ArrayBuffer in jsdom https://github.com/vitest-dev/vitest/issues/5365
    inBuffer = Buffer.from(new Uint8Array(inBuffer))
  }

  // this does not need to be cryptographically secure, SHA-1 is fine
  const outBuffer = await crypto.subtle.digest('SHA-1', inBuffer)
  const outBinString = arrayBufferToBinaryString(outBuffer)
  const res = btoa(outBinString)
  performance.measure('jsonChecksum', 'jsonChecksum')
  return res
}
