import fs from 'fs'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const START_MARKER = '<!-- i18n options start -->'
const END_MARKER = '<!-- i18n options end -->'

// Take the current English i18n object and inject it into the README
async function main () {
  let readme = await readFile('./README.md', 'utf8')
  const i18n = JSON.parse(await readFile('./src/picker/i18n/en.json', 'utf8'))
  const startIndex = readme.indexOf(START_MARKER)
  const endIndex = readme.indexOf(END_MARKER) + END_MARKER.length

  const sortedI18n = Object.fromEntries(Object.entries(i18n).sort((a, b) => a[0] < b[0] ? -1 : 1))

  readme = readme.substring(0, startIndex) +
    START_MARKER + '\n\n```json\n' +
    JSON.stringify(sortedI18n, null, 2) +
    '\n```\n\n' + END_MARKER +
    readme.substring(endIndex)

  await writeFile('./README.md', readme, 'utf8')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
