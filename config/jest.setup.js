import '@testing-library/jest-dom/extend-expect'
import 'fake-indexeddb/auto'
import { Crypto } from '@peculiar/webcrypto'
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())

global.fetch = require('node-fetch')
global.Response = fetch.Response
global.crypto = new Crypto()
