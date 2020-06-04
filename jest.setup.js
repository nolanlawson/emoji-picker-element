/* global jest */
import '@testing-library/jest-dom/extend-expect'
import 'fake-indexeddb/auto'
import fetch from 'node-fetch'

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())

global.fetch = fetch
