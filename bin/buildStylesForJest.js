import { buildStyles } from './buildStyles.js'
import { writeFile, mkdirp } from './fs.js'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Build a file containing the CSS just for Jest, because I can't figure out any better way to do this
async function main () {
  const styles = buildStyles()
  const targetDir = path.join(__dirname, '../node_modules/.cache/emoji-picker-element')
  await mkdirp(targetDir)
  await writeFile(
    path.join(targetDir, 'package.json'),
    '{ "type": "module" }',
    'utf8'
  )
  await writeFile(
    path.join(targetDir, 'styles.js'),
    `export default ${JSON.stringify(styles)};`,
    'utf8'
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
