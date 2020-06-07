import '@testing-library/jest-dom/extend-expect'
import 'fake-indexeddb/auto'
import { Crypto } from '@peculiar/webcrypto'
import { versionsAndTestEmoji } from '../bin/versionsAndTestEmoji'

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())

global.fetch = require('node-fetch')
global.Response = fetch.Response
global.crypto = new Crypto()

process.env.NODE_ENV = 'test'
process.env.VERSIONS_AND_TEST_EMOJI = versionsAndTestEmoji
