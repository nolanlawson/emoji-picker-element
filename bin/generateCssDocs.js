import path from 'path'
import sass from 'sass'
import { markdownTable as table } from 'markdown-table'
import { readFile, writeFile } from './fs.js'
import { replaceInReadme } from './replaceInReadme.js'
import postcss from 'postcss'
import { FONT_FAMILY } from '../src/picker/constants.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// To avoid code duplication, we could not declare this in variables.scss
const MANUAL_VARS = [{
  name: '--emoji-font-family',
  value: FONT_FAMILY,
  comment: 'Font family for a custom emoji font (as opposed to native emoji)'
}]

const START_MARKER = '<!-- CSS variable options start -->'
const END_MARKER = '<!-- CSS variable options end -->'

function extractCSSVariables (node) {
  const res = []
  for (let i = 0; i < node.nodes.length; i++) {
    const subNode = node.nodes[i]
    if (subNode.type === 'decl' && subNode.prop.startsWith('--')) {
      const nextNode = node.nodes[i + 1]
      const comment = (nextNode && nextNode.type === 'comment' && nextNode.text.trim()) || undefined
      res.push({
        name: subNode.prop,
        value: subNode.value,
        comment
      })
    }
  }
  return res
}

// Find all the CSS variables declared on the :host and print them out
// into the README as documentation
async function generateCssVariablesData (css) {
  const ast = postcss.parse(css)
  const hosts = ast.nodes.filter(({ selector }) => ([':host', ':host,\n:host(.light)'].includes(selector)))
  const darkHosts = ast.nodes.filter(({ selector }) => selector === ':host(.dark)')
  const vars = hosts.map(extractCSSVariables).flat().concat(MANUAL_VARS)
  const darkVars = darkHosts.map(extractCSSVariables).flat()

  const sortedVars = vars.sort((a, b) => a.name < b.name ? -1 : 1)

  return sortedVars.map(({ name, value, comment }) => {
    const darkIndex = darkVars.findIndex(_ => _.name === name)
    let darkValue = darkIndex !== -1 ? darkVars[darkIndex].value : ''
    if (darkValue === value) {
      darkValue = ''
    }

    const wrap = _ => ('`' + _ + '`')

    return [wrap(name), wrap(value), darkValue ? wrap(darkValue) : '', comment || '']
  })
}

function generateMarkdownTable (cssData) {
  const headers = ['Variable', 'Default', 'Default (dark)', 'Description']
  return table([
    headers,
    ...cssData
  ])
}

async function replaceInCustomElementsJson (cssData) {
  const jsonFilename = path.join(__dirname, '../custom-elements.json')
  const json = JSON.parse(await readFile(jsonFilename, 'utf8'))

  const unwrap = _ => _.substring(1, _.length - 1) // remove backticks

  json.modules[0].declarations[0].cssProperties = cssData.map(([name, value, darkValue, comment]) => {
    return {
      name: unwrap(name),
      description: `${comment} (default: ${value}${darkValue ? `, dark default: ${darkValue}` : ''})`.trim(),
      default: JSON.stringify(unwrap(value))
    }
  })
  await writeFile(jsonFilename, JSON.stringify(json, null, 2), 'utf8')
}

async function main () {
  const css = sass.renderSync({ file: './src/picker/styles/variables.scss' }).css.toString('utf8')

  const cssData = await generateCssVariablesData(css)
  const markdown = generateMarkdownTable(cssData)
  await replaceInReadme(START_MARKER, END_MARKER, markdown)
  await replaceInCustomElementsJson(cssData)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
