import { readFile, writeFile } from './fs.js'

export async function replaceInReadme (startMarker, endMarker, replacement) {
  let readme = await readFile('./README.md', 'utf8')
  const startIndex = readme.indexOf(startMarker)
  const endIndex = readme.indexOf(endMarker) + endMarker.length
  readme = readme.substring(0, startIndex) +
    startMarker + '\n\n' +
    replacement +
    '\n\n' + endMarker +
    readme.substring(endIndex)
  await writeFile('./README.md', readme, 'utf8')
}
