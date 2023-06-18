import path from 'node:path'
import { copyFile, readdir, writeFile, mkdirp, rimraf } from './fs.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function main () {
  const targetDir = path.join(__dirname, '../i18n')

  await rimraf(targetDir)
  await mkdirp(targetDir)

  const sourceDir = path.join(__dirname, '../src/picker/i18n')

  const sourceFiles = await readdir(sourceDir)

  await Promise.all(sourceFiles.map(async sourceFile => {
    await Promise.all([
      copyFile(path.join(sourceDir, sourceFile), path.join(targetDir, sourceFile)),
      writeFile(path.join(targetDir, sourceFile.replace('.js', '.d.ts')), `
import { I18n } from "../shared";
declare const _default: I18n;
export default _default;
      `.trim())
    ])
  }))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
