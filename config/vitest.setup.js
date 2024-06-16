import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { deleteDatabase } from '../src/database/databaseLifecycle'
import fetchMock from 'fetch-mock'

beforeAll(() => {
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
