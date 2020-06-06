import sass from 'sass'
import table from 'markdown-table'
import fs from 'fs'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const START_MARKER = '<!-- CSS variable options start -->'
const END_MARKER = '<!-- CSS variable options end -->'

function extractCSSVariables (css) {
  return [...css.matchAll(/(--[^:]+)\s*:\s*([^;]+)\s*;\s*(?:\/\*(.*?)\*\/)?/gs)]
    .map(_ => ({
      name: _[1],
      value: _[2],
      comments: _[3]
    }))
}

// Find all the CSS variables declared on the :host and print them out
// into the README as documentation
async function generateMarkdownTable (css) {
  css = css.replace(/@media.*?\{.*\}/sg, '')
  const hosts = [...css.matchAll(/:host\s*(?:,\s*:host\(\.light\))?\s*\{(.*?)\}/gs)].map(_ => _[1])
  const darkHosts = [...css.matchAll(/:host\(\.dark\)\s*\{(.*?)\}/gs)].map(_ => _[1])
  const vars = hosts.map(extractCSSVariables).flat()
  const darkVars = darkHosts.map(extractCSSVariables).flat()

  const sortedVars = vars.sort((a, b) => a.name < b.name ? -1 : 1)

  const data = sortedVars.map(({ name, value, comments }) => {
    const darkIndex = darkVars.findIndex(_ => _.name === name)
    let darkValue = darkIndex !== -1 ? darkVars[darkIndex].value : ''
    if (darkValue === value) {
      darkValue = ''
    }

    const wrap = _ => ('`' + _ + '`')

    return [wrap(name), wrap(value), darkValue ? wrap(darkValue) : '', comments || '']
  })
  const headers = ['Variable', 'Default', 'Default (dark)', 'Description']
  return table([
    headers,
    ...data
  ])
}

async function main () {
  const css = sass.renderSync({ file: './src/picker/styles/variables.scss' }).css.toString('utf8')
  const markdown = await generateMarkdownTable(css)
  let readme = await readFile('./README.md', 'utf8')
  const startIndex = readme.indexOf(START_MARKER)
  const endIndex = readme.indexOf(END_MARKER) + END_MARKER.length
  readme = readme.substring(0, startIndex) +
    START_MARKER + '\n\n' + markdown + '\n\n' + END_MARKER +
    readme.substring(endIndex)
  await writeFile('./README.md', readme, 'utf8')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
