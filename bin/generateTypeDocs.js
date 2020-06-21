import { replaceInReadme } from './replaceInReadme.js'
import { readFile } from './fs.js'
import replaceAll from 'string.prototype.replaceall'
replaceAll.shim()

const DB_START_MARKER = '<!-- database API start -->'
const DB_END_MARKER = '<!-- database API end -->'

const PICKER_START_MARKER = '<!-- picker API start -->'
const PICKER_END_MARKER = '<!-- picker API end -->'

// Given the typedoc output and generated into docs-tmp, inject these into the README
function removeLinks (str) {
  return str.replaceAll(/\[(.*?)\]\(.*?\)/sg, (_, p1) => p1)
}

function incrementHeadings (str) {
  return str.replaceAll(/#+/g, _ => `##${_}`) // increase indent of headings by two
}

async function injectDatabaseDocs () {
  let docs = await readFile('./docs-tmp/classes/_database_.database.md', 'utf8')
  docs = docs.substring(docs.lastIndexOf('## Constructors'))
  docs = removeLinks(docs)
  docs = incrementHeadings(docs)

  await replaceInReadme(DB_START_MARKER, DB_END_MARKER, docs)
}

async function injectPickerDocs () {
  let docs = await readFile('./docs-tmp/classes/_picker_.picker.md', 'utf8')
  docs = docs.substring(docs.indexOf('Name | Type'), docs.indexOf('**Returns:**'))
  docs = removeLinks(docs)

  await replaceInReadme(PICKER_START_MARKER, PICKER_END_MARKER, docs)
}

async function main () {
  await injectDatabaseDocs()
  await injectPickerDocs()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
