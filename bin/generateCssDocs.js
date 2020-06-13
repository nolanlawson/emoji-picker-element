import sass from 'sass'
import table from 'markdown-table'
import { replaceInReadme } from './replaceInReadme.js'
import postcss from 'postcss'

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
async function generateMarkdownTable (css) {
  const ast = postcss.parse(css)
  const hosts = ast.nodes.filter(({ selector }) => ([':host', ':host, :host(.light) .picker'].includes(selector)))
  const darkHosts = ast.nodes.filter(({ selector }) => selector === ':host(.dark), .picker.prefers-dark')
  const vars = hosts.map(extractCSSVariables).flat()
  const darkVars = darkHosts.map(extractCSSVariables).flat()

  const sortedVars = vars.sort((a, b) => a.name < b.name ? -1 : 1)

  const data = sortedVars.map(({ name, value, comment }) => {
    const darkIndex = darkVars.findIndex(_ => _.name === name)
    let darkValue = darkIndex !== -1 ? darkVars[darkIndex].value : ''
    if (darkValue === value) {
      darkValue = ''
    }

    const wrap = _ => ('`' + _ + '`')

    return [wrap(name), wrap(value), darkValue ? wrap(darkValue) : '', comment || '']
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
  await replaceInReadme(START_MARKER, END_MARKER, markdown)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
