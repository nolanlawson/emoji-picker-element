import { readFile } from './fs.js'
import markdownToc from 'markdown-toc'
import { replaceInReadme } from './replaceInReadme.js'

const TOC_START_MARKER = '<!-- toc start -->'
const TOC_END_MARKER = '<!-- toc end -->'

const CI_BADGE = /\[!\[Build status]\(.*?\)]\(.*?\)/

async function main () {
  const content = (await readFile('./README.md', 'utf8'))
    .replace(CI_BADGE, '') // remove travis badge, it confuses markdown-toc
  const toc = markdownToc(content).content
    .replace('#emoji-picker-element', '#emoji-picker-element-') // it confuses GitHub's anchor links too
  await replaceInReadme(TOC_START_MARKER, TOC_END_MARKER, toc)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
