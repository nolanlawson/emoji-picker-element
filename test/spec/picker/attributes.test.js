import { basicAfterEach, basicBeforeEach, FR_EMOJI, ALL_EMOJI, mockFrenchDataSource, tick } from '../shared'
import Picker from '../../../src/picker/PickerElement.js'
import { getByRole } from '@testing-library/dom'

describe('attributes tests', () => {
  beforeEach(async () => {
    basicBeforeEach()
    mockFrenchDataSource()
  })

  afterEach(basicAfterEach)

  test('setting initial locale/dataSource issues only one GET', async () => {
    const picker = new Picker()
    picker.setAttribute('locale', 'fr')
    picker.setAttribute('data-source', FR_EMOJI)
    document.body.appendChild(picker)
    await tick(20)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)

    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(FR_EMOJI)
    expect(picker.getAttribute('locale')).toEqual('fr')
    expect(picker.getAttribute('data-source')).toEqual(FR_EMOJI)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('can set skintone emoji using an attribute', async () => {
    const picker = new Picker()
    picker.setAttribute('data-source', ALL_EMOJI)
    picker.setAttribute('skin-tone-emoji', '✌')
    document.body.appendChild(picker)
    await tick(20)
    expect(getByRole(picker.shadowRoot, 'button', { name: /Choose a skin tone/ }).innerHTML)
      .toContain('✌')
    expect(picker.skinToneEmoji).toEqual('✌')
    expect(picker.getAttribute('skin-tone-emoji')).toEqual('✌')
    expect(picker.locale).toEqual('en')

    picker.setAttribute('skin-tone-emoji', '🏃')
    await tick(20)
    expect(getByRole(picker.shadowRoot, 'button', { name: /Choose a skin tone/ }).innerHTML)
      .toContain('🏃')
    expect(picker.skinToneEmoji).toEqual('🏃')

    document.body.removeChild(picker)
    await tick(20)
  })
})
