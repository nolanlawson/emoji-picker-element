import {
  ALL_EMOJI,
  ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG,
  basicAfterEach,
  basicBeforeEach,
  tick, truncatedFrEmoji
} from '../shared.js'
import Database from '../../../src/database/Database.js'
import { abortOpportunityEventTarget } from '../../../src/database/utils/abortSignalUtils.js'
import { mockFetch, mockGetAndHead } from '../mockFetch.js'

const waitForSignalAbortCalledNTimes = async (n) => {
  for (let i = 0; i < n; i++) {
    await Promise.race([
      new Promise(resolve => {
        abortOpportunityEventTarget.addEventListener('called', resolve, { once: true })
      }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('timed out waiting for abort opportunity')), 500))
    ])
  }
}

function runTest ({ secondLoad, dataChanged, dataSource, abortOpportunityCount }) {
  test(`throws no errors when DB is closed after ${abortOpportunityCount} signal.aborted calls`, async () => {
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
        mockFetch('get', dataSource, truncatedFrEmoji, { headers: { ETag: 'W/updated' } })
        mockFetch('head', dataSource, null)
      } else {
        mockGetAndHead(dataSource, truncatedFrEmoji, { headers: { ETag: 'W/updated' } })
      }
    }

    const db = new Database({ dataSource })
    await waitForSignalAbortCalledNTimes(abortOpportunityCount)
    const doClose = async () => {
      await db.close()
    }
    await doClose()
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
              maxExpectedAbortOpportunityCount: secondLoad ? 4 : 3
            },
            {
              testName: 'misconfigured etag',
              dataSource: ALL_EMOJI_MISCONFIGURED_ETAG,
              maxExpectedAbortOpportunityCount: secondLoad ? 4 : 3
            },
            {
              testName: 'no etag',
              dataSource: ALL_EMOJI_NO_ETAG,
              maxExpectedAbortOpportunityCount: secondLoad ? 5 : 3
            }
          ]
          scenarios.forEach(({ testName, dataSource, maxExpectedAbortOpportunityCount }) => {
            describe(testName, () => {
              // Number of times somebody called the getter on `signal.aborted` which
              // we are using as an easy way to get full code coverage here
              const abortOpportunityCounts = new Array(maxExpectedAbortOpportunityCount).fill().map((_, i) => i)
              abortOpportunityCounts.forEach(abortOpportunityCount => {
                runTest({ secondLoad, dataChanged, dataSource, abortOpportunityCount })
              })
            })
          })
        })
      })
    })
  })
})
