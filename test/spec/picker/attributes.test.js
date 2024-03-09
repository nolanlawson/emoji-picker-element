import {
  basicAfterEach,
  basicBeforeEach,
  FR_EMOJI,
  ALL_EMOJI,
  mockFrenchDataSource,
  tick
} from '../shared'
import Picker from '../../../src/picker/PickerElement.js'
import { getByRole } from '@testing-library/dom'
import { DEFAULT_DATA_SOURCE, DEFAULT_LOCALE } from '../../../src/database/constants'
import enI18n from '../../../src/picker/i18n/en.js'
import { DEFAULT_CATEGORY_SORTING, DEFAULT_SKIN_TONE_EMOJI } from '../../../src/picker/constants'

describe('attributes tests', () => {
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

  test('setting initial locale/dataSource issues only one GET', async () => {
    const picker = new Picker()
    picker.setAttribute('locale', 'fr')
    picker.setAttribute('data-source', FR_EMOJI)
    document.body.appendChild(picker)
    await tick(20)

    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(FR_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)

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

  test('change property while disconnected from DOM', async () => {
    const picker = new Picker()
    picker.setAttribute('data-source', ALL_EMOJI)
    document.body.appendChild(picker)
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
    picker.skinToneEmoji = '✌'
    expect(picker.skinToneEmoji).toEqual('✌')
    document.body.appendChild(picker)
    await tick(20)

    expect(getByRole(picker.shadowRoot, 'button', { name: /Choose a skin tone/ }).innerHTML)
      .toContain('✌')
    expect(picker.skinToneEmoji).toEqual('✌')

    document.body.removeChild(picker)
    await tick(20)
  })

  test('change attribute while disconnected from DOM', async () => {
    const picker = new Picker()
    picker.setAttribute('data-source', ALL_EMOJI)
    document.body.appendChild(picker)
    await tick(20)
    document.body.removeChild(picker)
    await tick(20)
    picker.setAttribute('skin-tone-emoji', '✌')
    expect(picker.skinToneEmoji).toEqual('✌')
    document.body.appendChild(picker)
    await tick(20)

    expect(getByRole(picker.shadowRoot, 'button', { name: /Choose a skin tone/ }).innerHTML)
      .toContain('✌')
    expect(picker.skinToneEmoji).toEqual('✌')
    expect(picker.getAttribute('skin-tone-emoji')).toEqual('✌')

    document.body.removeChild(picker)
    await tick(20)
  })

  function testDefaultProps (picker) {
    expect(picker.customCategorySorting).toEqual(DEFAULT_CATEGORY_SORTING)
    expect(picker.customEmoji).toEqual(null)
    expect(picker.dataSource).toEqual(DEFAULT_DATA_SOURCE)
    expect(picker.i18n).toEqual(enI18n)
    expect(picker.locale).toEqual(DEFAULT_LOCALE)
    expect(picker.skinToneEmoji).toEqual(DEFAULT_SKIN_TONE_EMOJI)
  }

  function expectTruthyDatabase (picker) {
    expect(typeof picker.database).toEqual('object')
    expect(picker.database).toBeTruthy()
  }

  test('default properties - connected', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    await tick(20)

    testDefaultProps(picker)
    expectTruthyDatabase(picker)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('default properties - disconnected', async () => {
    const picker = new Picker()
    document.body.appendChild(picker)
    await tick(20)

    document.body.removeChild(picker)
    await tick(20)

    testDefaultProps(picker)
    expectTruthyDatabase(picker)
  })

  test('default properties - never connected', async () => {
    const picker = new Picker()

    testDefaultProps(picker)
    expectTruthyDatabase(picker)

    document.body.appendChild(picker)
    await tick(20)

    document.body.removeChild(picker)
    await tick(20)
  })

  test('attributes present on element at creation time', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    div.innerHTML = `<emoji-picker locale="fr" data-source="${ALL_EMOJI}" skin-tone-emoji="✌"></emoji-picker>`
    const picker = div.querySelector('emoji-picker')
    await tick(20)
    expect(picker.locale).toEqual('fr')
    expect(picker.dataSource).toEqual(ALL_EMOJI)
    expect(picker.skinToneEmoji).toEqual('✌')
    expect(getByRole(picker.shadowRoot, 'button', { name: /Choose a skin tone/ }).innerHTML)
      .toContain('✌')

    expect(fetch.calls().length).toBe(1)
    expect(fetch.lastUrl()).toBe(ALL_EMOJI)
    expect(fetch.lastOptions()).toBe(undefined)

    document.body.removeChild(div)
    await tick(20)
  })
})
