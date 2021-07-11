import Picker from '../../../src/picker/PickerElement'
import { basicAfterEach, basicBeforeEach, FR_EMOJI, mockFrenchDataSource, tick } from '../shared'
import { DEFAULT_DATA_SOURCE } from '../../../src/database/constants'

describe('properties', () => {
  beforeEach(async () => {
    basicBeforeEach()
    mockFrenchDataSource()
  })

  afterEach(basicAfterEach)

  test('setting initial dataSource and locale', async () => {
    const picker = new Picker()
    picker.locale = 'fr'
    picker.dataSource = FR_EMOJI

    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(FR_EMOJI)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('setting initial dataSource', async () => {
    const picker = new Picker()
    picker.dataSource = FR_EMOJI

    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)

    expect(picker.locale).toEqual('en')
    expect(picker.dataSource).toEqual(FR_EMOJI)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('setting initial locale', async () => {
    const picker = new Picker()
    picker.locale = 'fr'

    document.body.appendChild(picker)

    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(DEFAULT_DATA_SOURCE, undefined)

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(DEFAULT_DATA_SOURCE)
    expect(picker.getAttribute('locale')).toEqual(null)
    expect(picker.getAttribute('data-source')).toEqual(null)

    document.body.removeChild(picker)
    await tick(20)
  })
})
