import '@testing-library/jest-dom/extend-expect'
import FDBFactory from 'fake-indexeddb/build/FDBFactory'
import FDBKeyRange from 'fake-indexeddb/build/FDBKeyRange'
import { Crypto } from '@peculiar/webcrypto'
import raf from 'raf'
import btoa from 'btoa'

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())
jest.setTimeout(60000)

global.fetch = require('node-fetch')
global.Response = fetch.Response
global.crypto = new Crypto()
global.requestAnimationFrame = raf
global.btoa = btoa

process.env.NODE_ENV = 'test'

global.IDBKeyRange = FDBKeyRange
beforeEach(() => {
  global.indexedDB = new FDBFactory() // fresh indexedDB for every test
})
