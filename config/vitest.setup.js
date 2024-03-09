import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'
import { deleteDatabase } from '../src/database/databaseLifecycle'
import styles from '../node_modules/.cache/emoji-picker-element/styles.js'
import fetchMock from 'fetch-mock'

beforeAll(() => {
  process.env.STYLES = styles

  globalThis.ResizeObserver = ResizeObserver
  globalThis.IDBKeyRange = IDBKeyRange
  globalThis.indexedDB = new IDBFactory()

  vi.spyOn(globalThis.console, 'log').mockImplementation(() => undefined)
  vi.spyOn(globalThis.console, 'warn').mockImplementation(() => undefined)
})

beforeEach(() => {
  globalThis.fetch = fetchMock.sandbox()
  globalThis.Response = fetch.Response
})

afterEach(async () => {
  // fresh indexedDB for every test
  const dbs = await globalThis.indexedDB.databases()
  await Promise.all(dbs.map(({ name }) => deleteDatabase(name)))
})
