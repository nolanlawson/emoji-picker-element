// Simple script to check bundlesize based on https://github.com/siddharthkp/bundlesize
import { minify } from 'terser'
import { gzip } from 'node:zlib'
import { promisify } from 'node:util'
import prettyBytes from 'pretty-bytes'
import fs from 'node:fs/promises'

const MAX_SIZE_MIN = '38 kB'
const MAX_SIZE_MINGZ = '13 kB'

const FILENAME = './bundle.js'

function parse (pretty) {
  // convert '41 kb' to 41000
  return parseFloat(pretty) * 1000
}

async function main () {
  const source = await fs.readFile(FILENAME, 'utf8')
  const { code } = await minify(source, {
    compress: true,
    mangle: true
  })
  const buff = Buffer.from(code, 'utf8')
  const sizeMin = buff.length

  console.log(`${FILENAME} minified: expected ${MAX_SIZE_MIN}, was ${prettyBytes(sizeMin)}`)

  const buffGzip = await promisify(gzip)(buff, { level: 9 })
  const sizeGzip = buffGzip.length
  console.log(`${FILENAME} min+gz  : expected ${MAX_SIZE_MINGZ}, was ${prettyBytes(sizeGzip)}`)
  if (parse(MAX_SIZE_MIN) < sizeMin || parse(MAX_SIZE_MINGZ) < sizeGzip) {
    throw new Error('FAILED: Exceeded maximum bundle size')
  } else {
    console.log('SUCCESS')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
