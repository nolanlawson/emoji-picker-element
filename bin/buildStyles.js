import sass from 'sass'
import cssnano from 'cssnano'
import path from 'path'
import postcss from 'postcss'
import { writeFile } from './fs.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main () {
  const file = path.join(__dirname, '../src/picker/styles/picker.scss')
  const css = sass.renderSync({ file, outputStyle: 'compressed' }).css
  const compressedCss = (await postcss([cssnano()]).process(css, { from: undefined })).css
  await writeFile(path.join(__dirname, '../picker.css'), compressedCss, 'utf8')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
