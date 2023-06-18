import {
  ALL_EMOJI,
  basicAfterEach,
  basicBeforeEach,
  FR_EMOJI,
  mockFrenchDataSource,
  tick, truncatedEmoji
} from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import enI18n from '../../../src/picker/i18n/en'
import Database from '../../../src/database/Database'
import { DEFAULT_SKIN_TONE_EMOJI } from '../../../src/picker/constants'
import { DEFAULT_DATA_SOURCE } from '../../../src/database/constants'
const { type } = userEvent

// Workaround for clear() not working in shadow roots: https://github.com/testing-library/user-event/issues/1143
const clear = async (element) => {
  expect(element.value.length).not.toBe(0)
  await type(element, '{backspace}'.repeat(element.value.length))
  expect(element.value.length).toBe(0)
}

const frI18n = JSON.parse(JSON.stringify(enI18n))

frI18n.searchLabel = 'Recherche'
frI18n.skinTones[0] = 'Défaut'
frI18n.categories['smileys-emotion'] = 'Sourires et emoticons'

describe('element tests', () => {
  describe('UI tests', () => {
    let picker
    let container

    beforeEach(async () => {
      basicBeforeEach()
      mockFrenchDataSource()
      await tick(40)
      picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
      container = picker.shadowRoot
      document.body.appendChild(picker)
      await tick(40)
    })
    afterEach(async () => {
      document.body.removeChild(picker)
      await tick(40)
      await new Database({ dataSource: FR_EMOJI, locale: 'fr' }).delete()
      await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
      await tick(40)
      await basicAfterEach()
    })

    test('changing locale/dataSource prop causes only one network request', async () => {
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
      await type(getByRole(container, 'combobox'), 'monkey face')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1), {
        timeout: 2000
      })
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
      picker.locale = 'fr'
      picker.dataSource = FR_EMOJI
      await tick(20)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)
      await clear(getByRole(container, 'combobox'))
      await type(getByRole(container, 'combobox'), 'singe tête')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1))
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
    })

    test('changing locale/dataSource attr causes only one network request', async () => {
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
      await type(getByRole(container, 'combobox'), 'monkey face')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1), {
        timeout: 2000
      })
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
      picker.setAttribute('locale', 'fr')
      picker.setAttribute('data-source', FR_EMOJI)
      await tick(20)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)
      await clear(getByRole(container, 'combobox'))
      await type(getByRole(container, 'combobox'), 'singe tête')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1))
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
    })

    test('can dynamically change i18n', async () => {
      picker.i18n = frI18n
      await tick(10)
      expect(getByRole(container, 'combobox', { name: 'Recherche' })).toBeVisible()
      expect(getByRole(container, 'tab', { name: 'Sourires et emoticons' })).toBeVisible()
      expect(getByRole(container, 'button', { name: 'Choose a skin tone (currently Défaut)' })).toBeVisible()
    })

    test('can change default skin tone emoji', async () => {
      expect(picker.skinToneEmoji).toBe(DEFAULT_SKIN_TONE_EMOJI)
      expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML)
        .toContain(DEFAULT_SKIN_TONE_EMOJI)
      picker.skinToneEmoji = '👇'
      await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👇'))
      picker.skinToneEmoji = '👋'
      await waitFor(() => expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👋'))
    })

    test('can get the locale/dataSource', () => {
      expect(picker.locale).toBe('en')
      expect(picker.dataSource).toBe(ALL_EMOJI)
    })
  })

  describe('defaults test', () => {
    beforeEach(() => {
      fetch.get(DEFAULT_DATA_SOURCE, () => new Response(JSON.stringify(truncatedEmoji), { headers: { ETag: 'W/aaa' } }))
      fetch.head(DEFAULT_DATA_SOURCE, () => new Response(null, { headers: { ETag: 'W/aaa' } }))
    })

    afterEach(basicAfterEach)

    test('has a default locale/dataSource', async () => {
      const picker = new Picker()
      document.body.appendChild(picker)
      const container = picker.shadowRoot
      await tick(20)

      await waitFor(() => expect(getByRole(container, 'menuitem', { name: /😀/ })).toBeVisible())

      await new Database().delete()
      await tick(20)
      await document.body.removeChild(picker)
      await tick(20)
    })
  })
})
