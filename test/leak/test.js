//
// Basic idea of this test is to add/remove the element to/from the DOM 10 times
// and then check for objects that are leaking some multiple of 10 times.
// I'd love to just say "if leaks > 0 then it's leaking", but Chrome seems to hold
// on to odd memory in odd places for no obvious reason.
//

/* global addPicker removePicker */
import puppeteer from 'puppeteer'

const ITERATIONS = 10

async function waitForServerReady () {
  while (true) {
    try {
      const resp = await fetch('http://localhost:3000')
      if (resp.status === 200) {
        break
      }
    } catch (err) {}
    console.log('Waiting for localhost:3000 to be available')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// see https://addyosmani.com/blog/puppeteer-recipes/#measuring-memory-leaks
async function getObjects (page) {
  const prototypeHandle = await page.evaluateHandle(() => Object.prototype)
  const objectsHandle = await page.queryObjects(prototypeHandle)
  const objectNames = await page.evaluate((instances) => instances.map(_ => (
    `${_.constructor.name}::${typeof _}`
  )), objectsHandle)

  await Promise.all([
    prototypeHandle.dispose(),
    objectsHandle.dispose()
  ])

  return objectNames
}

function objectsToCountMap (objects) {
  const res = {}
  for (const obj of objects) {
    if (!res[obj]) {
      res[obj] = 0
    }
    res[obj]++
  }
  return res
}

function diff (objectsBefore, objectsAfter) {
  const countsBefore = objectsToCountMap(objectsBefore)
  const countsAfter = objectsToCountMap(objectsAfter)

  const diff = {}
  for (const [obj, count] of Object.entries(countsAfter)) {
    const beforeCount = countsBefore[obj] || 0
    const diffCount = count - beforeCount
    if (diffCount > 0) {
      diff[obj] = diffCount
    }
  }
  return diff
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function addAndRemovePicker (page) {
  await page.evaluate(() => addPicker())
  await sleep(1000)
  await page.evaluate(() => removePicker())
  await sleep(1000)
}

async function main () {
  await waitForServerReady()
  const browser = await puppeteer.launch({ headless: 'new' })
  const context = await browser.createIncognitoBrowserContext() // not sure why Addy uses incognito, but sure
  const page = await context.newPage()
  await page.goto('http://localhost:3000/')

  console.log('Running', ITERATIONS, 'iterations...')

  // run once to load any one-time JS costs
  await addAndRemovePicker(page)

  await sleep(5000)
  const objectsBefore = await getObjects(page)

  // do several iterations to identify obvious memory leaks (things leaking n times)
  for (let i = 0; i < ITERATIONS; i++) {
    console.log('iteration', i + 1)
    await addAndRemovePicker(page)
  }

  await sleep(5000)
  const objectsAfter = await getObjects(page)

  await browser.close()

  console.log('object count before', objectsBefore.length, 'object count after', objectsAfter.length)
  const comparison = diff(objectsBefore, objectsAfter)
  console.log('diff', comparison)

  const likelyLeaks = [...Object.entries(comparison)]
    .filter(([object, count]) => (count % ITERATIONS === 0))

  if (likelyLeaks.length) {
    console.log('Likely leaks', likelyLeaks)
    throw new Error('Found likely leaks, throwing error')
  } else {
    console.log('No likely leaks')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
