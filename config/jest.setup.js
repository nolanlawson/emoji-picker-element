import '@testing-library/jest-dom/extend-expect'
import FDBFactory from 'fake-indexeddb/build/FDBFactory'
import FDBKeyRange from 'fake-indexeddb/build/FDBKeyRange'
import { Crypto } from '@peculiar/webcrypto'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'
import { deleteDatabase } from '../src/database/databaseLifecycle'
import styles from '../node_modules/.cache/emoji-picker-element/styles.js'

// See https://github.com/jsdom/jsdom/issues/3455#issuecomment-1333567714
global.crypto.subtle = new Crypto().subtle

if (!global.performance) {
  global.performance = {}
}
if (!global.performance.mark) {
  global.performance.mark = () => {}
}
if (!global.performance.measure) {
  global.performance.measure = () => {}
}

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())
jest.setTimeout(60000)

global.fetch = require('node-fetch')
global.Response = fetch.Response
global.ResizeObserver = ResizeObserver

process.env.NODE_ENV = 'test'

process.env.STYLES = styles

global.IDBKeyRange = FDBKeyRange
global.indexedDB = new FDBFactory()

beforeAll(() => {
  jest.spyOn(global.console, 'log').mockImplementation()
  jest.spyOn(global.console, 'warn').mockImplementation()
})

afterEach(async () => {
  // fresh indexedDB for every test
  const dbs = await global.indexedDB.databases()
  await Promise.all(dbs.map(({ name }) => deleteDatabase(name)))
})
