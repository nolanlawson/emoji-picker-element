import {
  ALL_EMOJI,
  ALL_EMOJI_MISCONFIGURED_ETAG,
  ALL_EMOJI_NO_ETAG,
  basicAfterEach,
  basicBeforeEach,
  tick
} from '../shared.js'
import Database from '../../../src/database/Database.js'

describe('database timing tests', () => {
  beforeEach(basicBeforeEach)
  afterEach(basicAfterEach)

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
      new Array(5).fill().forEach((_, count) => {
        test(`throws no errors when DB is canceled after ${count} ticks`, async () => {
          // first load
          const db = new Database({ dataSource })
          await tick(count)
          await db.close()
          await tick(40)

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
