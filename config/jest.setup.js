import '@testing-library/jest-dom/extend-expect'
import FDBFactory from 'fake-indexeddb/build/FDBFactory'
import FDBKeyRange from 'fake-indexeddb/build/FDBKeyRange'
import { Crypto } from '@peculiar/webcrypto'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'
import { deleteDatabase } from '../src/database/databaseLifecycle'

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
global.crypto = new Crypto()
global.ResizeObserver = ResizeObserver

process.env.NODE_ENV = 'test'

global.IDBKeyRange = FDBKeyRange
global.indexedDB = new FDBFactory()

jest.mock('emoji-picker-element-styles', () => '', { virtual: true })

beforeAll(() => {
  jest.spyOn(global.console, 'log').mockImplementation()
  jest.spyOn(global.console, 'warn').mockImplementation()
  jest.spyOn(global.console, 'error').mockImplementation()
})

afterEach(async () => {
  // fresh indexedDB for every test
  const dbs = await global.indexedDB.databases()
  await Promise.all(dbs.map(({ name }) => deleteDatabase(name)))
})
