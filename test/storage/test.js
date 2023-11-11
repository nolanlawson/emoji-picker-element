import glob from 'fast-glob'
import playwright from 'playwright'
import { mkdirp, rimraf } from '../../bin/fs.js'
import getFolderSize from 'get-folder-size'
import path from 'node:path'
import prettyBytes from 'pretty-bytes'
import { markdownTable as table } from 'markdown-table'
import process from 'process'

const port = process.env.PORT || 3000

function printBytes (bytes) {
  return `${prettyBytes(bytes)} (${bytes})`
}

function getIdbFolder (browserType, userDataDir) {
  switch (browserType) {
    case 'chromium':
      return path.join(userDataDir, `Default/IndexedDB/http_localhost_${port}.indexeddb.leveldb`)
    case 'firefox':
      return path.join(userDataDir, `storage/default/http+++localhost+${port}/idb`)
    case 'webkit':
      // IDB is stored in what appears to be a checksum-encoded folder, e.g.:
      // storage/<checksum>-<checksum>/<checksum>-<checksum>/IndexedDB/<checksum>/
      return path.dirname(glob.sync(path.join(userDataDir, 'storage/**/**/IndexedDB/**'))[0])
  }
}

async function main () {
  const results = []

  for (const browserType of ['chromium', 'firefox', 'webkit']) {
    const userDataDir = `/tmp/emoji-picker-browser-data-${browserType}`
    await rimraf(userDataDir)
    await mkdirp(userDataDir)
    const context = await playwright[browserType].launchPersistentContext(userDataDir, { headless: true })
    const page = await context.newPage()
    await page.goto(`http://localhost:${port}`)
    await page.waitForSelector('.load-time')
    await context.close()

    const idbFolder = getIdbFolder(browserType, userDataDir)
    const { size: bytes } = await getFolderSize(idbFolder)
    results.push({
      browserType,
      bytes
    })
  }

  console.log(table([
    ['Browser', 'IDB folder size'],
    ...results.map(({ browserType, bytes }) => (
      [browserType, printBytes(bytes)]
    ))
  ]))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
