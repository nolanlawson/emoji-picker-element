import {
  ALL_EMOJI,
  ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG,
  basicAfterEach,
  basicBeforeEach,
  tick, truncatedFrEmoji
} from '../shared.js'
import Database from '../../../src/database/Database.js'
import { signalAbortedEventTarget } from '../../../src/database/utils/isSignalAborted.js'
import { mockFetch, mockGetAndHead } from '../mockFetch.js'

const waitForSignalAbortCalledNTimes = async (n) => {
  for (let i = 0; i < n; i++) {
    await Promise.race([
      new Promise(resolve => {
        signalAbortedEventTarget.addEventListener('called', resolve, { once: true })
      }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('timed out waiting for signal.aborted call')), 1000))
    ])
  }
}

function runTest ({ secondLoad, dataChanged, dataSource, signalAbortedCallCount }) {
  test(`throws no errors when DB is closed after ${signalAbortedCallCount} signal.aborted calls`, async () => {
    if (secondLoad) {
      // do a throwaway first load
      const db = new Database({ dataSource })
      await db.ready()
      await db.close()
      await tick(40)
    }

    if (dataChanged) {
      // second time - update, data is v2
      fetch.reset()
      if (dataSource === ALL_EMOJI_NO_ETAG) {
        mockGetAndHead(dataSource, truncatedFrEmoji)
      } else if (dataSource === ALL_EMOJI_MISCONFIGURED_ETAG) {
        mockFetch('get', dataSource, truncatedFrEmoji, { headers: { ETag: 'W/yyy' } })
        mockFetch('head', dataSource, null)
      } else {
        mockGetAndHead(dataSource, truncatedFrEmoji, { headers: { ETag: 'W/yyy' } })
      }
    }

    const db2 = new Database({ dataSource })
    await waitForSignalAbortCalledNTimes(signalAbortedCallCount)
    await db2.close()
    await tick(40)
  })
}

describe('database timing tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  const secondLoads = [false, true]
  secondLoads.forEach(secondLoad => {
    describe(`secondLoad=${secondLoad}`, () => {
      const dataChangeds = secondLoad ? [false, true] : [false]
      dataChangeds.forEach(dataChanged => {
        describe(`dataChanged=${dataChanged}`, () => {
          const scenarios = [
            {
              testName: 'basic',
              dataSource: ALL_EMOJI,
              maxExpectedSignalAbortedCallCount: secondLoad ? (dataChanged ? 6 : 5) : 4
            },
            {
              testName: 'misconfigured etag',
              dataSource: ALL_EMOJI_MISCONFIGURED_ETAG,
              maxExpectedSignalAbortedCallCount: secondLoad ? 6 : 4
            },
            {
              testName: 'no etag',
              dataSource: ALL_EMOJI_NO_ETAG,
              maxExpectedSignalAbortedCallCount: secondLoad ? 7 : 5
            }
          ]
          scenarios.forEach(({ testName, dataSource, maxExpectedSignalAbortedCallCount }) => {
            // Number of times somebody called the getter on `signal.aborted` which
            // we are using as an easy way to get full code coverage here
            const signalAbortedCallCounts = new Array(maxExpectedSignalAbortedCallCount).fill().map((_, i) => i)

            signalAbortedCallCounts.forEach(signalAbortedCallCount => {
              describe(testName, () => {
                runTest({ secondLoad, dataChanged, dataSource, signalAbortedCallCount })
              })
            })
          })
        })
      })
    })
  })
})
