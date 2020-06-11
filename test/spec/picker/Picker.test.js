import { basicBeforeEach, basicAfterEach, ALL_EMOJI, truncatedEmoji } from '../shared'
import * as testingLibrary from '@testing-library/dom'
import Picker from '../../../src/picker/PickerElement.js'
import userEvent from '@testing-library/user-event'

const { waitFor, fireEvent } = testingLibrary

describe('Picker tests', () => {
  let picker
  let container

  const { getAllByRole, getByRole, queryAllByRole } = new Proxy(testingLibrary, {
    get (obj, prop) {
      return function (...args) {
        return obj[prop](container, ...args)
      }
    }
  })

  const activeElement = () => container.getRootNode().activeElement

  beforeEach(async () => {
    basicBeforeEach()
    picker = new Picker({ dataSource: ALL_EMOJI, locale: 'en' })
    document.body.appendChild(picker)
    container = picker.shadowRoot.querySelector('.picker')
    await waitFor(() => expect(getAllByRole('menuitem')).toHaveLength(numInGroup1))
  })
  afterEach(async () => {
    basicAfterEach()
    await picker.database.delete()
  })

  const numInGroup1 = truncatedEmoji.filter(_ => _.group === 0).length
  const numInGroup2 = truncatedEmoji.filter(_ => _.group === 1).length

  test('basic picker test', async () => {
    await waitFor(() => expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible())
    expect(getAllByRole('tab')).toHaveLength(9)

    expect(getByRole('tab', { name: 'Smileys and emoticons', selected: true })).toBeVisible()
    expect(getAllByRole('menuitem')).toHaveLength(numInGroup1)

    expect(getByRole('tab', { name: 'People and body' })).toBeVisible()
    fireEvent.click(getByRole('tab', { name: 'People and body' }))

    await waitFor(() => expect(getAllByRole('menuitem')).toHaveLength(numInGroup2))
    expect(getByRole('tab', { name: 'People and body', selected: true })).toBeVisible()
  })

  test('basic search test', async () => {
    await userEvent.type(getByRole('textbox'), 'monk')

    await waitFor(() => expect(getAllByRole('option')).toHaveLength(2))

    expect(getByRole('option', { name: /🐵/ })).toBeVisible()
    expect(getByRole('option', { name: /🐒/ })).toBeVisible()
  })

  test('basic skintone test', async () => {
    await waitFor(() => expect(getByRole('button', { name: 'Choose a skin tone (currently Default)' })).toBeVisible())
    expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0)
    await fireEvent.click(getByRole('button', { name: 'Choose a skin tone (currently Default)' }))
    await waitFor(() => expect(getByRole('listbox', { name: 'Skin tones' })).toBeVisible())
    expect(getAllByRole('option')).toHaveLength(6)
    expect(getByRole('option', { name: 'Default', selected: true })).toBeVisible()
    getByRole('option', { name: 'Default', selected: true }).focus() // have to explicitly focus for some reason (?)

    const pressKeyAndExpectActiveOption = async (key, name) => {
      await fireEvent.keyDown(activeElement(), { key, code: key })
      await waitFor(() => expect(getByRole('option', { name, selected: true })).toBeVisible())
      getByRole('option', { name, selected: true }).focus() // have to explicitly focus for some reason (?)
    }

    await pressKeyAndExpectActiveOption('ArrowDown', 'Light')
    await pressKeyAndExpectActiveOption('ArrowDown', 'Medium-Light')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Light')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Default')
    await pressKeyAndExpectActiveOption('ArrowUp', 'Dark')

    await fireEvent.click(activeElement(), { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(queryAllByRole('listbox', { name: 'Skin tones' })).toHaveLength(0))
    expect(getByRole('button', { name: 'Choose a skin tone (currently Dark)' })).toBeVisible()
  })

  test('nav keyboard test', async () => {
    getByRole('tab', { name: 'Smileys and emoticons', selected: true }).focus()

    const expectGroupLength = async group => {
      await waitFor(() => expect(getAllByRole('menuitem'))
        .toHaveLength(truncatedEmoji.filter(_ => _.group === group).length))
    }

    const pressKeyAndExpectActiveTab = async (key, name, group) => {
      await fireEvent.keyDown(activeElement(), { key, code: key })
      await fireEvent.click(activeElement())
      await waitFor(() => expect(getByRole('tab', { name, selected: true })).toBeVisible())
      getByRole('tab', { name, selected: true }).focus() // have to explicitly focus for some reason (?)
      await expectGroupLength(group)
    }

    await expectGroupLength(0)
    await pressKeyAndExpectActiveTab('ArrowRight', 'People and body', 1)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Animals and nature', 3)
    await pressKeyAndExpectActiveTab('ArrowLeft', 'People and body', 1)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Animals and nature', 3)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Food and drink', 4)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Travel and places', 5)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Activities', 6)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Objects', 7)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Symbols', 8)
    await pressKeyAndExpectActiveTab('ArrowRight', 'Flags', 9)
  })
})
