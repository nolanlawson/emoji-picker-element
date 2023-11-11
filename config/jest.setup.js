import '@testing-library/jest-dom/jest-globals'
import { jest } from '@jest/globals'
import * as FakeIndexedDB from 'fake-indexeddb'
import { Crypto } from '@peculiar/webcrypto'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'
import { deleteDatabase } from '../src/database/databaseLifecycle'
import styles from '../node_modules/.cache/emoji-picker-element/styles.js'
import * as fetchMockJest from 'fetch-mock-jest'

const { IDBFactory, IDBKeyRange } = FakeIndexedDB

// See https://github.com/jsdom/jsdom/issues/3455#issuecomment-1333567714
globalThis.crypto.subtle = new Crypto().subtle

if (!globalThis.performance) {
  globalThis.performance = {}
}
if (!globalThis.performance.mark) {
  globalThis.performance.mark = () => {}
}
if (!globalThis.performance.measure) {
  globalThis.performance.measure = () => {}
}

jest.setTimeout(60000)

globalThis.ResizeObserver = ResizeObserver

process.env.NODE_ENV = 'test'

process.env.STYLES = styles

globalThis.IDBKeyRange = IDBKeyRange
globalThis.indexedDB = new IDBFactory()

beforeAll(() => {
  jest.spyOn(globalThis.console, 'log').mockImplementation()
  jest.spyOn(globalThis.console, 'warn').mockImplementation()

  const fetch = fetchMockJest.default.sandbox()
  globalThis.fetch = fetch
  globalThis.Response = fetch.Response
})

afterEach(async () => {
  // fresh indexedDB for every test
  const dbs = await globalThis.indexedDB.databases()
  await Promise.all(dbs.map(({ name }) => deleteDatabase(name)))
})
