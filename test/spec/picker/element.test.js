import {
  ALL_EMOJI,
  basicAfterEach,
  basicBeforeEach,
  FR_EMOJI,
  mockFrenchDataSource,
  tick
} from '../shared'
import Picker from '../../../src/picker/PickerElement'
import { getAllByRole, getByRole, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { mergeI18n } from '../../../src/picker/utils/mergeI18n'
import enI18n from '../../../src/picker/i18n/en'
import Database from '../../../src/database/Database'
import { DEFAULT_SKIN_TONE_EMOJI } from '../../../src/picker/constants'
const { type, clear } = userEvent

describe('element tests', () => {
  describe('data tests', () => {
    test('can merge i18n object, partial translation', async () => {
      const partialFrI18n = {
        search: 'Recherche',
        skinTones: [
          'Défaut'
        ],
        categories: {
          'smileys-emotion': 'Sourires et emoticons'
        }
      }
      const expected = JSON.parse(JSON.stringify(enI18n))
      expected.search = partialFrI18n.search
      expected.skinTones[0] = partialFrI18n.skinTones[0]
      expected.categories['smileys-emotion'] = partialFrI18n.categories['smileys-emotion']
      const mergedI18n = mergeI18n(enI18n, partialFrI18n)
      expect(mergedI18n).toStrictEqual(expected)
    })
  })
  describe('UI tests', () => {
    let picker
    let container

    beforeEach(async () => {
      basicBeforeEach()
      mockFrenchDataSource()
      picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
      container = picker.shadowRoot.querySelector('.picker')
      document.body.appendChild(picker)
      await tick(20)
    })
    afterEach(async () => {
      await new Database({ dataSource: FR_EMOJI, locale: 'fr' }).delete()
      await new Database({ dataSource: ALL_EMOJI, locale: 'en' }).delete()
      await tick(20)
      basicAfterEach()
      document.body.removeChild(picker)
    })

    test('changing locale/dataSource causes only one network request', async () => {
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenLastCalledWith(ALL_EMOJI, undefined)
      await type(getByRole(container, 'searchbox'), 'monkey face')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1))
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
      picker.locale = 'fr'
      picker.dataSource = FR_EMOJI
      await tick(20)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith(FR_EMOJI, undefined)
      await clear(getByRole(container, 'searchbox'))
      await type(getByRole(container, 'searchbox'), 'singe tête')
      await waitFor(() => expect(getAllByRole(container, 'option')).toHaveLength(1))
      expect(getByRole(container, 'option', { name: /🐵/ })).toBeVisible()
    })

    test('can dynamically change i18n', async () => {
      const partialFrI18n = {
        search: 'Recherche',
        skinTones: [
          'Défaut'
        ],
        categories: {
          'smileys-emotion': 'Sourires et emoticons'
        }
      }
      await tick(20)
      picker.i18n = partialFrI18n
      expect(getByRole(container, 'searchbox', { name: 'Recherche' })).toBeVisible()
      expect(getByRole(container, 'tab', { name: 'Sourires et emoticons' })).toBeVisible()
      expect(getByRole(container, 'button', { name: 'Choose a skin tone (currently Défaut)' })).toBeVisible()
    })

    test('can change default skin tone emoji', async () => {
      expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain(DEFAULT_SKIN_TONE_EMOJI)
      picker.skinToneEmoji = '👇'
      expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👇')
      picker.skinToneEmoji = '👋'
      expect(getByRole(container, 'button', { name: /Choose a skin tone/ }).innerHTML).toContain('👋')
    })

    test('can get the locale/dataSource', () => {
      expect(picker.locale).toBe('en')
      expect(picker.dataSource).toBe(ALL_EMOJI)
    })
  })
})
