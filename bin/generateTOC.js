import { readFile } from './fs.js'
import markdownToc from 'markdown-toc'
import { replaceInReadme } from './replaceInReadme.js'

const TOC_START_MARKER = '<!-- toc start -->'
const TOC_END_MARKER = '<!-- toc end -->'

async function main () {
  const content = await readFile('./README.md', 'utf8')
  const toc = markdownToc(content)
  await replaceInReadme(TOC_START_MARKER, TOC_END_MARKER, toc.content)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
