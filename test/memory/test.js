import puppeteer from 'puppeteer'
import prettyBytes from 'pretty-bytes'
import table from 'markdown-table'

const scenarios = [
  'picker',
  'compact',
  'full'
]

async function measureMemory (scenario) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '-enable-experimental-web-platform-features'
    ]
  })
  const page = await browser.newPage()
  await page.goto(`http://localhost:3000?${scenario}=1`, {
    waitUntil: 'networkidle0'
  })
  await new Promise(resolve => setTimeout(resolve, 2000))
  const bytes = await page.evaluate(async () => (await performance.measureMemory()).bytes)
  await browser.close()
  return bytes
}

async function main () {
  const results = []
  for (const scenario of scenarios) {
    const bytes = await measureMemory(scenario)
    results.push([
      scenario,
      bytes,
      prettyBytes(bytes)
    ])
  }
  console.log(table([['Scenario', 'Bytes', 'Pretty bytes'], ...results]))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
