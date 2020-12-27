import '@testing-library/jest-dom/extend-expect'
import FDBFactory from 'fake-indexeddb/build/FDBFactory'
import FDBKeyRange from 'fake-indexeddb/build/FDBKeyRange'
import { Crypto } from '@peculiar/webcrypto'
import { ResizeObserver } from 'd2l-resize-aware/resize-observer-module.js'

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())
jest.setTimeout(60000)

global.fetch = require('node-fetch')
global.Response = fetch.Response
global.crypto = new Crypto()
global.ResizeObserver = ResizeObserver

process.env.NODE_ENV = 'test'

global.IDBKeyRange = FDBKeyRange
beforeEach(() => {
  global.indexedDB = new FDBFactory() // fresh indexedDB for every test
})
