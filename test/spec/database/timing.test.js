import {
  ALL_EMOJI,
  ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG,
  basicAfterEach,
  basicBeforeEach,
  tick, truncatedFrEmoji
} from '../shared.js'
import Database from '../../../src/database/Database.js'

describe('database timing tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

  const dataChanges = [false, true]
  dataChanges.forEach(dataChanged => {
    describe(`dataChanged=${dataChanged}`, () => {
      const scenarios = [
        {
          testName: 'basic',
          dataSource: ALL_EMOJI
        },
        {
          testName: 'misconfigured etag server',
          dataSource: ALL_EMOJI_MISCONFIGURED_ETAG
        },
        {
          testName: 'missing etag server',
          dataSource: ALL_EMOJI_NO_ETAG
        }
      ]
      scenarios.forEach(({ testName, dataSource }) => {
        describe(testName, () => {
          new Array(10).fill().forEach((_, count) => {
            test(`throws no errors when DB is canceled after ${count} ticks`, async () => {
              // first load
              const db = new Database({ dataSource })
              await tick(count)
              await db.close()
              await tick(40)

              if (dataChanged) {
                // second time - update, data is v2
                fetch.reset()
                fetch.get(dataSource, () => new Response(JSON.stringify(truncatedFrEmoji), { headers: { ETag: 'W/yyy' } }), { delay: 1 })
                fetch.head(dataSource, () => new Response(null, { headers: { ETag: 'W/yyy' } }), { delay: 1 })
              }

              // second load
              const db2 = new Database({ dataSource })
              await tick(count)
              await db2.close()
              await tick(40)
            })
          })
        })
      })
    })
  })
})
