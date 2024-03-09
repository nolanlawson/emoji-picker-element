import { vi } from 'vitest'
import * as FakeIndexedDB from 'fake-indexeddb'
import { Crypto } from '@peculiar/webcrypto'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'
import { deleteDatabase } from '../src/database/databaseLifecycle'
import styles from '../node_modules/.cache/emoji-picker-element/styles.js'
import createFetchMock from 'vitest-fetch-mock'

const fetchMocker = createFetchMock(vi)

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks()

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

globalThis.ResizeObserver = ResizeObserver

process.env.NODE_ENV = 'test'

process.env.STYLES = styles

globalThis.IDBKeyRange = IDBKeyRange
globalThis.indexedDB = new IDBFactory()

// Hack to work around an issue with jest-environment-jsdom https://github.com/jsdom/jsdom/issues/3363
globalThis.structuredClone = globalThis.structuredClone ?? (_ => JSON.parse(JSON.stringify(_)))

beforeAll(() => {
  vi.spyOn(globalThis.console, 'log').mockImplementation()
  vi.spyOn(globalThis.console, 'warn').mockImplementation()
})

afterEach(async () => {
  // fresh indexedDB for every test
  const dbs = await globalThis.indexedDB.databases()
  await Promise.all(dbs.map(({ name }) => deleteDatabase(name)))
})
