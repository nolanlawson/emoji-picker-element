import { readFile } from './fs.js'
import markdownToc from 'markdown-toc'
import { replaceInReadme } from './replaceInReadme.js'

const TOC_START_MARKER = '<!-- toc start -->'
const TOC_END_MARKER = '<!-- toc end -->'

const TRAVIS_BADGE = /\[!\[Build Status]\(.*?\)]\(.*?\)/

async function main () {
  const content = (await readFile('./README.md', 'utf8'))
    .replace(TRAVIS_BADGE, '') // remove travis badge, it confuses markdown-toc
  const toc = markdownToc(content).content
  await replaceInReadme(TOC_START_MARKER, TOC_END_MARKER, toc)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
