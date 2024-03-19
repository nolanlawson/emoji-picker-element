import Picker from '../../../src/picker/PickerElement'
import { basicAfterEach, basicBeforeEach, FR_EMOJI, mockFrenchDataSource, tick } from '../shared'
import { DEFAULT_DATA_SOURCE } from '../../../src/database/constants'

describe('properties', () => {
  beforeEach(async () => {
    await basicBeforeEach()
    await mockFrenchDataSource()
    await tick(40)
  })
  afterEach(async () => {
    await tick(40)
    await basicAfterEach()
    await tick(40)
  })

  test.skip('setting initial dataSource and locale', async () => {
    const picker = new Picker()
    picker.locale = 'fr'
    picker.dataSource = FR_EMOJI

    document.body.appendChild(picker)

    await tick(40)

    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(FR_EMOJI)
    expect(fetch.lastOptions().method).toBe(undefined)

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(FR_EMOJI)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(40)
  })

  test('setting initial dataSource', async () => {
    const picker = new Picker()
    picker.dataSource = FR_EMOJI

    document.body.appendChild(picker)

    await tick(40)

    console.info(fetch.calls()[0][1].signal.aborted)
    console.info(fetch.calls()[1][1].signal.aborted)
    console.info(fetch.calls())
    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(FR_EMOJI)
    expect(fetch.lastOptions().method).toBe(undefined)

    expect(picker.locale).toEqual('en')
    expect(picker.dataSource).toEqual(FR_EMOJI)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(40)
  })

  test('setting initial locale', async () => {
    const picker = new Picker()
    picker.locale = 'fr'

    document.body.appendChild(picker)

    await tick(40)

    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(DEFAULT_DATA_SOURCE)
    expect(fetch.lastOptions().method).toBe(undefined)

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(DEFAULT_DATA_SOURCE)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(40)
  })
})
