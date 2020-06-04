import '@testing-library/jest-dom/extend-expect'
import 'fake-indexeddb/auto'
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())

global.fetch = require('node-fetch')
